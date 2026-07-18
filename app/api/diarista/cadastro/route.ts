import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validarCPF } from "@/lib/cpf";
import { getCidade } from "@/lib/bairros";
import { preencherContrato, VERSAO_CONTRATO, type PlanoContrato } from "@/lib/contratos";
import { emailCadastroGratuito } from "@/lib/email";

export const runtime = "nodejs";

function err(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      senha,
      nomeCompleto,
      cpf,
      whatsapp,
      whatsapp2,
      cidadeSlug,
      bairros,
      atendeTodosBairros,
      servicos,
      precos,
      imoveis,
    } = body;

    // Plano do onboarding: "gratuito" ou "profissional".
    const plano: PlanoContrato = body.plano === "profissional" ? "profissional" : "gratuito";
    const ehProfissional = plano === "profissional";

    const cidadeInfo = getCidade(cidadeSlug ?? "sao-paulo");

    // ── a) Campos obrigatórios ────────────────────────────────────────
    if (!email)                     return err("E-mail é obrigatório.");
    if (!senha || senha.length < 6) return err("A senha precisa ter no mínimo 6 caracteres.");
    if (!nomeCompleto)              return err("Nome completo é obrigatório.");
    if (!cpf)                       return err("CPF é obrigatório.");
    if (!whatsapp)                  return err("WhatsApp é obrigatório.");
    if (!cidadeInfo)                return err("Cidade inválida.");
    if (!servicos?.length)          return err("Selecione pelo menos 1 tipo de serviço.");
    if (!imoveis?.length)           return err("Selecione pelo menos 1 tipo de imóvel.");

    const nBairros = Array.isArray(bairros) ? bairros.length : 0;
    const temWhats2 = !!whatsapp2;

    // ── b) Validação dos LIMITES por plano (no servidor) ──────────────
    if (!ehProfissional) {
      // Plano Gratuito: 1 serviço, 1 bairro, 1 WhatsApp, sem "atende todos".
      if (servicos.length !== 1) return err("O plano Gratuito permite apenas 1 serviço.");
      if (atendeTodosBairros)    return err("O plano Gratuito não permite atender todos os bairros.");
      if (nBairros !== 1)        return err("O plano Gratuito permite apenas 1 bairro.");
      if (temWhats2)             return err("O plano Gratuito permite apenas 1 WhatsApp.");
      if (body.aceiteContrato !== true)
        return err("É necessário aceitar o contrato para concluir o cadastro.");
    } else {
      // Plano Profissional: até 5 serviços, até 2 WhatsApp.
      if (servicos.length > 5)   return err("O plano Profissional permite no máximo 5 serviços.");
      if (!atendeTodosBairros && nBairros < 1)
        return err("Selecione ao menos 1 bairro ou marque que atende todos.");
      if (body.aceiteContratoGratuito !== true || body.aceiteContratoProfissional !== true)
        return err("É necessário aceitar os dois contratos para continuar.");
    }

    // ── c) CPF ────────────────────────────────────────────────────────
    if (!validarCPF(cpf)) return err("CPF inválido.");
    const cpfNumeros = cpf.replace(/\D/g, "");

    const { data: cpfExistente } = await supabaseAdmin
      .from("diaristas").select("id").eq("cpf", cpfNumeros).maybeSingle();
    if (cpfExistente) return err("Já existe um cadastro com este CPF.");

    // ── d) Usuário no Supabase Auth ───────────────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });
    if (authError) {
      if (authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("already been registered")) {
        return err("Este e-mail já está cadastrado.");
      }
      return err(`Erro ao criar conta: ${authError.message}`);
    }
    const userId = authData.user.id;

    // ── e) A conta SEMPRE nasce Gratuita. No onboarding Profissional, se os
    //       dados excedem os limites do Gratuito, o perfil fica OCULTO
    //       (ativo=false, ajuste_pendente=true) até o pagamento confirmar
    //       ou a diarista ajustar. Isso impede uma Gratuita de aparecer nas
    //       buscas com benefícios de paga. ────────────────────────────
    const excedeGratuito =
      ehProfissional &&
      (servicos.length > 1 || nBairros > 1 || !!atendeTodosBairros || temWhats2);

    const { data: diarista, error: diaErr } = await supabaseAdmin
      .from("diaristas")
      .insert({
        user_id:               userId,
        nome_completo:         nomeCompleto,
        cpf:                   cpfNumeros,
        whatsapp:              whatsapp.replace(/\D/g, ""),
        ...(ehProfissional && temWhats2 ? { whatsapp2: whatsapp2.replace(/\D/g, "") } : {}),
        cidade:                cidadeInfo.nome,
        atende_todos_bairros:  ehProfissional ? !!atendeTodosBairros : false,
        plano:                 "free",
        ativo:                 !excedeGratuito,
        ajuste_pendente:       excedeGratuito,
      })
      .select("id")
      .single();

    if (diaErr || !diarista) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return err(`Erro ao salvar cadastro: ${diaErr?.message ?? "desconhecido"}`);
    }
    const diaId = diarista.id;

    // ── f) Bairros ────────────────────────────────────────────────────
    if (!atendeTodosBairros && nBairros) {
      const { data: bairroRows } = await supabaseAdmin
        .from("bairros")
        .select("id, slug")
        .eq("cidade", cidadeInfo.cidadeDb)
        .in("slug", bairros);
      if (bairroRows?.length) {
        await supabaseAdmin.from("diarista_bairros").insert(
          bairroRows.map((b: { id: string }) => ({ diarista_id: diaId, bairro_id: b.id }))
        );
      }
    }

    // ── g) Serviços (+ faixa de preço interna) ────────────────────────
    const { data: servicoRows } = await supabaseAdmin
      .from("servicos").select("id, slug").in("slug", servicos);
    if (servicoRows?.length) {
      await supabaseAdmin.from("diarista_servicos").insert(
        servicoRows.map((s: { id: string }) => ({ diarista_id: diaId, servico_id: s.id }))
      );
      const FAIXAS_VALIDAS = ["ate-100", "100-150", "150-200", "200-300", "acima-300"];
      if (precos && typeof precos === "object") {
        const precoRows = servicoRows
          .filter((s: { slug: string }) => FAIXAS_VALIDAS.includes(precos[s.slug]))
          .map((s: { id: string; slug: string }) => ({
            diarista_id: diaId,
            servico_id:  s.id,
            faixa:       precos[s.slug] as string,
          }));
        if (precoRows.length) {
          await supabaseAdmin.from("diarista_servico_preco").insert(precoRows);
        }
      }
    }

    // ── h) Imóveis ────────────────────────────────────────────────────
    const { data: imovelRows } = await supabaseAdmin
      .from("imoveis").select("id, slug").in("slug", imoveis);
    if (imovelRows?.length) {
      await supabaseAdmin.from("diarista_imoveis").insert(
        imovelRows.map((i: { id: string }) => ({ diarista_id: diaId, imovel_id: i.id }))
      );
    }

    // ── i) Aceite(s) de contrato — IP e data/hora capturados no servidor ─
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "desconhecido";
    const dataHoraDate = new Date();
    const dataHoraLegivel = dataHoraDate.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "America/Sao_Paulo",
    });

    async function registrarAceite(planoContrato: PlanoContrato) {
      const textoContrato = preencherContrato(planoContrato, {
        nome: nomeCompleto,
        documento: cpf,
        dataHora: `${dataHoraLegivel} (horário de Brasília)`,
        ip,
      });
      await supabaseAdmin.from("aceites_contrato").insert({
        diarista_id:         diaId,
        plano:               planoContrato,
        versao_contrato:     VERSAO_CONTRATO,
        nome_assinante:      nomeCompleto,
        documento_assinante: cpf,
        texto_contrato:      textoContrato,
        data_hora_aceite:    dataHoraDate.toISOString(),
        ip_aceite:           ip,
      });
    }

    if (ehProfissional) {
      // DOIS aceites: o do Gratuito (rege a conta) e o do Profissional (rege a assinatura).
      await registrarAceite("gratuito");
      await registrarAceite("profissional");
    } else {
      await registrarAceite("gratuito");
    }

    // Email de boas-vindas do Gratuito (best-effort). No Profissional, o email
    // de boas-vindas sai só APÓS o pagamento confirmar (webhook).
    if (!ehProfissional) {
      await emailCadastroGratuito(email, nomeCompleto);
    }

    return NextResponse.json({ ok: true, diaristaId: diaId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 });
  }
}
