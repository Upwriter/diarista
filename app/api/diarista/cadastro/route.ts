import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validarCPF } from "@/lib/cpf";
import { getCidade } from "@/lib/bairros";
import { preencherContrato, VERSAO_CONTRATO, type PlanoContrato } from "@/lib/contratos";

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
      aceiteContrato,
    } = body;

    // Plano atual do cadastro (hoje só o Gratuito está ativo).
    const plano: PlanoContrato = body.plano === "profissional" ? "profissional" : "gratuito";

    // Resolve a cidade escolhida (para gravação e para filtrar bairros).
    const cidadeInfo = getCidade(cidadeSlug ?? "sao-paulo");

    // ── a) Validação dos campos obrigatórios ──────────────────────────
    if (!email)                         return err("E-mail é obrigatório.");
    if (!senha || senha.length < 6)     return err("A senha precisa ter no mínimo 6 caracteres.");
    if (!nomeCompleto)                  return err("Nome completo é obrigatório.");
    if (!cpf)                           return err("CPF é obrigatório.");
    if (!whatsapp)                      return err("WhatsApp é obrigatório.");
    if (!cidadeInfo)                    return err("Cidade inválida.");
    if (!servicos?.length)              return err("Selecione pelo menos 1 tipo de serviço.");
    if (!imoveis?.length)               return err("Selecione pelo menos 1 tipo de imóvel.");
    if (!atendeTodosBairros && !bairros?.length)
      return err("Selecione pelo menos 1 bairro ou marque que atende todos.");
    if (aceiteContrato !== true)        return err("É necessário ler e aceitar o contrato para concluir o cadastro.");

    // ── b) Validação do CPF ───────────────────────────────────────────
    if (!validarCPF(cpf)) return err("CPF inválido.");
    const cpfNumeros = cpf.replace(/\D/g, "");

    // ── c) CPF duplicado ──────────────────────────────────────────────
    const { data: cpfExistente } = await supabaseAdmin
      .from("diaristas")
      .select("id")
      .eq("cpf", cpfNumeros)
      .maybeSingle();
    if (cpfExistente) return err("Já existe um cadastro com este CPF.");

    // ── d) Criar usuário no Supabase Auth ─────────────────────────────
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

    // ── e) Inserir diarista ───────────────────────────────────────────
    const { data: diarista, error: diaErr } = await supabaseAdmin
      .from("diaristas")
      .insert({
        user_id:               userId,
        nome_completo:         nomeCompleto,
        cpf:                   cpfNumeros,
        whatsapp:              whatsapp.replace(/\D/g, ""),
        ...(whatsapp2 ? { whatsapp2: whatsapp2.replace(/\D/g, "") } : {}),
        cidade:                cidadeInfo.nome,
        atende_todos_bairros:  !!atendeTodosBairros,
        plano:                 "free",
        ativo:                 true,
      })
      .select("id")
      .single();

    if (diaErr || !diarista) {
      // Rollback: remove o usuário Auth criado
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return err(`Erro ao salvar cadastro: ${diaErr?.message ?? "desconhecido"}`);
    }

    const diaId = diarista.id;

    // ── f) Bairros ────────────────────────────────────────────────────
    // Filtra pela CIDADE + slug, pois bairros de cidades diferentes podem
    // ter o mesmo slug (ex.: "centro" em São Paulo e em Guarujá).
    if (!atendeTodosBairros && bairros?.length) {
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

    // ── g) Serviços ───────────────────────────────────────────────────
    const { data: servicoRows } = await supabaseAdmin
      .from("servicos")
      .select("id, slug")
      .in("slug", servicos);

    if (servicoRows?.length) {
      await supabaseAdmin.from("diarista_servicos").insert(
        servicoRows.map((s: { id: string }) => ({ diarista_id: diaId, servico_id: s.id }))
      );

      // Faixa de preço por serviço (dado interno). Só grava as faixas válidas
      // informadas para serviços que a diarista realmente selecionou.
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
      .from("imoveis")
      .select("id, slug")
      .in("slug", imoveis);

    if (imovelRows?.length) {
      await supabaseAdmin.from("diarista_imoveis").insert(
        imovelRows.map((i: { id: string }) => ({ diarista_id: diaId, imovel_id: i.id }))
      );
    }

    // ── i) Registro do aceite do contrato (assinatura digital) ─────────
    // IP e data/hora capturados NO SERVIDOR (não confiamos no cliente).
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

    const textoContrato = preencherContrato(plano, {
      nome: nomeCompleto,
      documento: cpf, // como informado no cadastro
      dataHora: `${dataHoraLegivel} (horário de Brasília)`,
      ip,
    });

    await supabaseAdmin.from("aceites_contrato").insert({
      diarista_id:         diaId,
      plano,
      versao_contrato:     VERSAO_CONTRATO,
      nome_assinante:      nomeCompleto,
      documento_assinante: cpf,
      texto_contrato:      textoContrato,
      data_hora_aceite:    dataHoraDate.toISOString(),
      ip_aceite:           ip,
    });

    // ── j) Sucesso ────────────────────────────────────────────────────
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 });
  }
}