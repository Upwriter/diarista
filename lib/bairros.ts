// Fonte de verdade dos bairros que viram páginas de SEO.
// Agora com suporte a múltiplas cidades. Para adicionar um bairro, inclua-o
// na cidade correta abaixo: a página /<cidade>-diarista-<bairro> é gerada
// automaticamente.

export type ZonaNome = "Zona Oeste" | "Zona Sul" | "Zona Norte" | "Zona Leste" | "Centro";

export interface Bairro {
  nome: string;
  slug: string;
  cidadeSlug: string;
  zona?: ZonaNome; // só São Paulo usa zonas
}

export interface Zona {
  nome: ZonaNome;
  slug: string;
  preposicao: string; // "na" ou "no"
}

export interface Cidade {
  nome: string;      // exibição, com acento: "São Paulo"
  slug: string;      // usado nas URLs: "sao-paulo"
  cidadeDb: string;  // valor gravado na coluna bairros.cidade: "Sao Paulo"
  uf: string;
  temZonas: boolean;
  hubPath: string;   // ex: "/diaristas-em-sao-paulo"
  preposicao: string; // "em"
}

// Compat: default de São Paulo (usado por páginas que assumem a capital).
export const CIDADE = "São Paulo";
export const UF = "SP";

export const CIDADES: Cidade[] = [
  { nome: "São Paulo", slug: "sao-paulo", cidadeDb: "Sao Paulo", uf: "SP", temZonas: true,  hubPath: "/diaristas-em-sao-paulo", preposicao: "em" },
  { nome: "Guarujá",   slug: "guaruja",   cidadeDb: "Guaruja",   uf: "SP", temZonas: false, hubPath: "/diaristas-em-guaruja",   preposicao: "em" },
];

// Gera slug a partir do nome (sem acento, hífens). Deve bater com o SQL.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ZONAS: Zona[] = [
  { nome: "Zona Leste", slug: "leste", preposicao: "na" },
  { nome: "Zona Norte", slug: "norte", preposicao: "na" },
  { nome: "Zona Oeste", slug: "oeste", preposicao: "na" },
  { nome: "Zona Sul", slug: "sul", preposicao: "na" },
  { nome: "Centro", slug: "centro", preposicao: "no" },
];

// ── São Paulo (77 bairros) ────────────────────────────────────────────
const BAIRROS_SP: Omit<Bairro, "cidadeSlug">[] = [
  // Centro
  { nome: "Sé", slug: "se", zona: "Centro" },
  { nome: "República", slug: "republica", zona: "Centro" },
  { nome: "Higienópolis", slug: "higienopolis", zona: "Centro" },
  { nome: "Consolação", slug: "consolacao", zona: "Centro" },
  { nome: "Bela Vista", slug: "bela-vista", zona: "Centro" },
  { nome: "Bixiga", slug: "bixiga", zona: "Centro" },
  { nome: "Bom Retiro", slug: "bom-retiro", zona: "Centro" },
  { nome: "Brás", slug: "bras", zona: "Centro" },
  { nome: "Cambuci", slug: "cambuci", zona: "Centro" },
  { nome: "Liberdade", slug: "liberdade", zona: "Centro" },
  { nome: "Santa Cecília", slug: "santa-cecilia", zona: "Centro" },
  { nome: "Campos Elíseos", slug: "campos-eliseos", zona: "Centro" },
  // Zona Oeste
  { nome: "Pinheiros", slug: "pinheiros", zona: "Zona Oeste" },
  { nome: "Vila Madalena", slug: "vila-madalena", zona: "Zona Oeste" },
  { nome: "Perdizes", slug: "perdizes", zona: "Zona Oeste" },
  { nome: "Lapa", slug: "lapa", zona: "Zona Oeste" },
  { nome: "Barra Funda", slug: "barra-funda", zona: "Zona Oeste" },
  { nome: "Butantã", slug: "butanta", zona: "Zona Oeste" },
  { nome: "Morumbi", slug: "morumbi", zona: "Zona Oeste" },
  { nome: "Alto de Pinheiros", slug: "alto-de-pinheiros", zona: "Zona Oeste" },
  { nome: "Vila Leopoldina", slug: "vila-leopoldina", zona: "Zona Oeste" },
  { nome: "Jaguaré", slug: "jaguare", zona: "Zona Oeste" },
  { nome: "Pompeia", slug: "pompeia", zona: "Zona Oeste" },
  { nome: "Sumaré", slug: "sumare", zona: "Zona Oeste" },
  // Zona Sul
  { nome: "Jardim Paulista", slug: "jardim-paulista", zona: "Zona Sul" },
  { nome: "Jardim América", slug: "jardim-america", zona: "Zona Sul" },
  { nome: "Jardim Europa", slug: "jardim-europa", zona: "Zona Sul" },
  { nome: "Jardim Paulistano", slug: "jardim-paulistano", zona: "Zona Sul" },
  { nome: "Itaim Bibi", slug: "itaim-bibi", zona: "Zona Sul" },
  { nome: "Vila Olímpia", slug: "vila-olimpia", zona: "Zona Sul" },
  { nome: "Vila Mariana", slug: "vila-mariana", zona: "Zona Sul" },
  { nome: "Moema", slug: "moema", zona: "Zona Sul" },
  { nome: "Saúde", slug: "saude", zona: "Zona Sul" },
  { nome: "Ipiranga", slug: "ipiranga", zona: "Zona Sul" },
  { nome: "Jabaquara", slug: "jabaquara", zona: "Zona Sul" },
  { nome: "Campo Belo", slug: "campo-belo", zona: "Zona Sul" },
  { nome: "Brooklin", slug: "brooklin", zona: "Zona Sul" },
  { nome: "Santo Amaro", slug: "santo-amaro", zona: "Zona Sul" },
  { nome: "Vila Andrade", slug: "vila-andrade", zona: "Zona Sul" },
  { nome: "Panamby", slug: "panamby", zona: "Zona Sul" },
  { nome: "Campo Limpo", slug: "campo-limpo", zona: "Zona Sul" },
  { nome: "Capão Redondo", slug: "capao-redondo", zona: "Zona Sul" },
  { nome: "Jardim Ângela", slug: "jardim-angela", zona: "Zona Sul" },
  { nome: "Interlagos", slug: "interlagos", zona: "Zona Sul" },
  { nome: "Cidade Dutra", slug: "cidade-dutra", zona: "Zona Sul" },
  { nome: "Grajaú", slug: "grajau", zona: "Zona Sul" },
  { nome: "Parelheiros", slug: "parelheiros", zona: "Zona Sul" },
  // Zona Leste
  { nome: "Tatuapé", slug: "tatuape", zona: "Zona Leste" },
  { nome: "Anália Franco", slug: "analia-franco", zona: "Zona Leste" },
  { nome: "Mooca", slug: "mooca", zona: "Zona Leste" },
  { nome: "Belém", slug: "belem", zona: "Zona Leste" },
  { nome: "Penha", slug: "penha", zona: "Zona Leste" },
  { nome: "Vila Formosa", slug: "vila-formosa", zona: "Zona Leste" },
  { nome: "Carrão", slug: "carrao", zona: "Zona Leste" },
  { nome: "Itaquera", slug: "itaquera", zona: "Zona Leste" },
  { nome: "Artur Alvim", slug: "artur-alvim", zona: "Zona Leste" },
  { nome: "São Miguel Paulista", slug: "sao-miguel-paulista", zona: "Zona Leste" },
  { nome: "Ermelino Matarazzo", slug: "ermelino-matarazzo", zona: "Zona Leste" },
  { nome: "Guaianases", slug: "guaianases", zona: "Zona Leste" },
  { nome: "Cidade Tiradentes", slug: "cidade-tiradentes", zona: "Zona Leste" },
  { nome: "Sapopemba", slug: "sapopemba", zona: "Zona Leste" },
  { nome: "Vila Prudente", slug: "vila-prudente", zona: "Zona Leste" },
  // Zona Norte
  { nome: "Santana", slug: "santana", zona: "Zona Norte" },
  { nome: "Tucuruvi", slug: "tucuruvi", zona: "Zona Norte" },
  { nome: "Mandaqui", slug: "mandaqui", zona: "Zona Norte" },
  { nome: "Casa Verde", slug: "casa-verde", zona: "Zona Norte" },
  { nome: "Limão", slug: "limao", zona: "Zona Norte" },
  { nome: "Freguesia do Ó", slug: "freguesia-do-o", zona: "Zona Norte" },
  { nome: "Brasilândia", slug: "brasilandia", zona: "Zona Norte" },
  { nome: "Cachoeirinha", slug: "cachoeirinha", zona: "Zona Norte" },
  { nome: "Vila Maria", slug: "vila-maria", zona: "Zona Norte" },
  { nome: "Vila Guilherme", slug: "vila-guilherme", zona: "Zona Norte" },
  { nome: "Jaçanã", slug: "jacana", zona: "Zona Norte" },
  { nome: "Tremembé", slug: "tremembe", zona: "Zona Norte" },
  { nome: "Pirituba", slug: "pirituba", zona: "Zona Norte" },
  { nome: "Jaraguá", slug: "jaragua", zona: "Zona Norte" },
  { nome: "Perus", slug: "perus", zona: "Zona Norte" },
];

// ── Guarujá (44 bairros, sem zonas) ───────────────────────────────────
const BAIRROS_GUARUJA_NOMES = [
  "Acapulco", "Astúrias", "Baia Branca", "Barreira do João Guarda", "Barra Funda",
  "Bela Vista", "Cachoeira", "Caiçara", "Camburi", "Centro", "Cidade Atlântica",
  "Construtores", "Cruz das Almas", "Enseada", "Ferry Boat", "Guaiúba",
  "Jardim Alvorada", "Jardim Alice", "Jardim Boa Esperança", "Jardim Brasil",
  "Jardim Enseada", "Jardim Helena Maria", "Jardim Las Palmas", "Jardim Mar e Céu",
  "Jardim Menina Moça", "Jardim Praiano", "Jardim Progresso", "Jardim Santa Maria",
  "Jardim São Miguel", "Jardim Virgínia", "Mar Casado", "Morrinhos", "Paecara",
  "Outeiro", "Perequê", "Pitangueiras", "Pouca Farinha", "Santa Cruz dos Navegantes",
  "Santa Rosa", "Santo Antônio", "São Manuel", "Sítio Paecara", "Tombo", "Tortugas",
  "Vicente de Carvalho", "Vila Baiana",
];
const BAIRROS_GUARUJA: Omit<Bairro, "cidadeSlug">[] = BAIRROS_GUARUJA_NOMES.map((nome) => ({
  nome,
  slug: slugify(nome),
}));

export const BAIRROS: Bairro[] = [
  ...BAIRROS_SP.map((b) => ({ ...b, cidadeSlug: "sao-paulo" })),
  ...BAIRROS_GUARUJA.map((b) => ({ ...b, cidadeSlug: "guaruja" })),
];

// ── Helpers ───────────────────────────────────────────────────────────
export function getCidade(slug: string): Cidade | undefined {
  return CIDADES.find((c) => c.slug === slug);
}

export function getBairro(cidadeSlug: string, bairroSlug: string): Bairro | undefined {
  return BAIRROS.find((b) => b.cidadeSlug === cidadeSlug && b.slug === bairroSlug);
}

export function getZona(slug: string): Zona | undefined {
  return ZONAS.find((z) => z.slug === slug);
}

export function bairrosDaCidade(cidadeSlug: string): Bairro[] {
  return BAIRROS.filter((b) => b.cidadeSlug === cidadeSlug);
}

// Bairros de uma zona (apenas São Paulo).
export function bairrosDaZona(zona: ZonaNome): Bairro[] {
  return BAIRROS.filter((b) => b.cidadeSlug === "sao-paulo" && b.zona === zona);
}

// Bairros vizinhos: mesma cidade (e mesma zona, quando houver).
export function bairrosVizinhos(cidadeSlug: string, bairroSlug: string, limite = 8): Bairro[] {
  const atual = getBairro(cidadeSlug, bairroSlug);
  if (!atual) return [];
  if (atual.cidadeSlug === "sao-paulo" && atual.zona) {
    return BAIRROS.filter(
      (b) => b.cidadeSlug === cidadeSlug && b.zona === atual.zona && b.slug !== bairroSlug
    ).slice(0, limite);
  }
  return BAIRROS.filter(
    (b) => b.cidadeSlug === cidadeSlug && b.slug !== bairroSlug
  ).slice(0, limite);
}

// ── URLs ──────────────────────────────────────────────────────────────
export function urlBairro(cidadeSlug: string, bairroSlug: string): string {
  return `/${cidadeSlug}-diarista-${bairroSlug}`;
}

export function urlZona(zonaSlug: string): string {
  return `/sao-paulo-diarista-zona-${zonaSlug}`;
}
