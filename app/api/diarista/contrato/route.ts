import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Substitui pontuação "inteligente" por ASCII para garantir a codificação
// no PDF (WinAnsi). Acentos do português são preservados.
function sanitizar(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ");
}

export async function GET() {
  // ── Autenticação: só a própria diarista (via sessão em cookie) ────────
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!diarista) {
    return NextResponse.json({ erro: "Perfil não encontrado." }, { status: 404 });
  }

  // Aceite mais recente desta diarista.
  const { data: aceite } = await supabaseAdmin
    .from("aceites_contrato")
    .select("plano, versao_contrato, nome_assinante, documento_assinante, texto_contrato, data_hora_aceite, ip_aceite")
    .eq("diarista_id", diarista.id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!aceite) {
    return NextResponse.json({ erro: "Nenhum contrato assinado encontrado." }, { status: 404 });
  }

  // ── Monta o PDF ───────────────────────────────────────────────────────
  const pdf = await PDFDocument.create();
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const fonteBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const A4 = { w: 595.28, h: 841.89 };
  const margem = 50;
  const larguraMax = A4.w - margem * 2;
  const verde = rgb(0.055, 0.42, 0.36);

  let page = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - margem;

  function novaPagina() {
    page = pdf.addPage([A4.w, A4.h]);
    y = A4.h - margem;
  }

  function quebrar(texto: string, f: typeof fonte, tamanho: number): string[] {
    const palavras = texto.split(/\s+/);
    const linhas: string[] = [];
    let linha = "";
    for (const p of palavras) {
      const teste = linha ? `${linha} ${p}` : p;
      if (f.widthOfTextAtSize(teste, tamanho) > larguraMax && linha) {
        linhas.push(linha);
        linha = p;
      } else {
        linha = teste;
      }
    }
    if (linha) linhas.push(linha);
    return linhas;
  }

  function escrever(texto: string, tamanho: number, f: typeof fonte, cor = rgb(0.1, 0.1, 0.1)) {
    const alturaLinha = tamanho * 1.4;
    const paragrafos = sanitizar(texto).split("\n");
    for (const par of paragrafos) {
      if (par.trim() === "") {
        y -= alturaLinha * 0.6;
        continue;
      }
      for (const linha of quebrar(par, f, tamanho)) {
        if (y < margem + alturaLinha) novaPagina();
        page.drawText(linha, { x: margem, y, size: tamanho, font: f, color: cor });
        y -= alturaLinha;
      }
    }
  }

  // Cabeçalho
  escrever("Diarista Perto de Mim — Contrato assinado", 15, fonteBold, verde);
  y -= 6;
  escrever(
    `Versão: ${aceite.versao_contrato}  |  Plano: ${aceite.plano}  |  ` +
      `Assinante: ${aceite.nome_assinante} (${aceite.documento_assinante ?? "-"})`,
    9,
    fonte,
    rgb(0.4, 0.4, 0.4)
  );
  escrever(
    `Aceite em: ${new Date(aceite.data_hora_aceite).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} ` +
      `(horário de Brasília)  |  IP: ${aceite.ip_aceite ?? "-"}`,
    9,
    fonte,
    rgb(0.4, 0.4, 0.4)
  );
  y -= 10;

  // Corpo: o texto EXATO do contrato aceito (já com os campos preenchidos).
  escrever(aceite.texto_contrato, 10, fonte);

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="contrato-diarista-perto-de-mim.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
