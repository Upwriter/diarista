// Fonte de verdade dos bairros que viram páginas de SEO.
// Para adicionar um bairro novo, basta incluir um item aqui e publicar:
// uma página /diarista/<slug> é gerada automaticamente.

export type ZonaNome = "Zona Oeste" | "Zona Sul" | "Zona Norte" | "Zona Leste" | "Centro";

export interface Bairro {
  nome: string;
  slug: string;
  zona: ZonaNome;
}

export interface Zona {
  nome: ZonaNome;
  slug: string;
  preposicao: string; // "na" ou "no" — para o título soar natural
}

export const CIDADE = "São Paulo";
export const UF = "SP";

// As 5 zonas viram páginas próprias: /diarista/zona/<slug>
export const ZONAS: Zona[] = [
  { nome: "Zona Leste", slug: "leste", preposicao: "na" },
  { nome: "Zona Norte", slug: "norte", preposicao: "na" },
  { nome: "Zona Oeste", slug: "oeste", preposicao: "na" },
  { nome: "Zona Sul", slug: "sul", preposicao: "na" },
  { nome: "Centro", slug: "centro", preposicao: "no" },
];

export const BAIRROS: Bairro[] = [
  // ----- Centro
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

  // ----- Zona Oeste
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

  // ----- Zona Sul
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

  // ----- Zona Leste
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

  // ----- Zona Norte
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

export function getBairro(slug: string): Bairro | undefined {
  return BAIRROS.find((b) => b.slug === slug);
}

export function getZona(slug: string): Zona | undefined {
  return ZONAS.find((z) => z.slug === slug);
}

export function bairrosDaZona(zona: ZonaNome): Bairro[] {
  return BAIRROS.filter((b) => b.zona === zona);
}

// Bairros vizinhos (mesma zona) — usados nos links internos da página de bairro
export function bairrosVizinhos(slug: string, limite = 8): Bairro[] {
  const atual = getBairro(slug);
  if (!atual) return [];
  return BAIRROS.filter((b) => b.zona === atual.zona && b.slug !== slug).slice(0, limite);
}
