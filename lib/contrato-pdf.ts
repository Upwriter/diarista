import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface AceiteContrato {
  plano: string;
  versao_contrato: string;
  nome_assinante: string;
  documento_assinante: string | null;
  texto_contrato: string;
  data_hora_aceite: string;
  ip_aceite: string | null;
}

// Substitui pontuação "inteligente" por ASCII para garantir a codificação
// no PDF (WinAnsi). Acentos do português são preservados.
function sanitizar(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ");
}

// Gera o PDF do contrato a partir de um registro de aceite.
export async function gerarContratoPdf(aceite: AceiteContrato): Promise<Uint8Array> {
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

  escrever(aceite.texto_contrato, 10, fonte);

  return pdf.save();
}
