import sanitizeHtml from "sanitize-html";

// Gera um slug a partir de um texto (título).
export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Extrai os blocos <script type="application/ld+json"> válidos do HTML.
function extrairLdJson(html: string): string[] {
  const blocos: string[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const corpo = m[1].trim();
    try {
      JSON.parse(corpo); // só mantém JSON válido
      blocos.push(corpo);
    } catch {
      // ignora JSON-LD inválido
    }
  }
  return blocos;
}

// Sanitiza o HTML colado: remove TODOS os <script>, exceto os JSON-LD válidos,
// que são reanexados ao final. Mantém as demais tags/atributos intactos.
export function sanitizarConteudo(html: string): string {
  const ldJson = extrairLdJson(html);

  // Remove todos os scripts antes de sanitizar.
  const semScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  const limpo = sanitizeHtml(semScripts, {
    allowedTags: false, // permite todas as demais tags (conteúdo do admin, confiável)
    allowedAttributes: false, // preserva classes, ids, styles do Gutenberg
    allowVulnerableTags: true,
  });

  const ld = ldJson
    .map((j) => `\n<script type="application/ld+json">${j}</script>`)
    .join("");

  return limpo.trim() + ld;
}

// Extrai a URL da primeira <img> encontrada no HTML (para capa automática).
export function primeiraImagem(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
