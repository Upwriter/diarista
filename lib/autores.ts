// Fonte única dos autores/equipe. Usada tanto na página /sobre-nos quanto no
// blog (topo e rodapé do artigo). Mostre apenas as redes que cada autor tem.

export interface Autor {
  id: string; // identificador salvo em posts_blog.autor (ex.: "filipi", "larissa")
  nome: string;
  cargo: string;
  foto: string;
  bio: string;
  instagram?: string;
  linkedin?: string;
}

export const AUTORES: Record<string, Autor> = {
  filipi: {
    id: "filipi",
    nome: "Filipi Padovese",
    cargo: "Co-Fundador e Especialista em SEO",
    foto: "/images/equipe/filipi-padovese.jpg",
    bio:
      "Filipi é especialista em SEO e fundador da Upwriter, agência de otimização para " +
      "buscadores. A ideia do Diarista Perto de Mim nasceu ao perceber, de perto, a " +
      "dificuldade de conhecidos para encontrar uma diarista — e o quanto as próprias " +
      "diaristas dependiam quase só da indicação boca a boca para conseguir novos trabalhos. " +
      "Foi daí que surgiu o propósito de criar uma ponte direta entre quem precisa do serviço " +
      "e quem faz dele sua profissão.",
    instagram: "https://www.instagram.com/filipi.pado/",
  },
  larissa: {
    id: "larissa",
    nome: "Larissa Adomaitis",
    cargo: "Co-Fundadora e Especialista em SEO",
    foto: "/images/equipe/larissa-adomaitis.jpg",
    bio:
      "Larissa é a head de SEO do Diarista Perto de Mim. Ela aplica seu conhecimento em " +
      "otimização para buscadores para fortalecer a conexão entre quem procura uma diarista " +
      "e as profissionais cadastradas na plataforma.",
    instagram: "https://www.instagram.com/larissa.adomaitis",
    linkedin: "https://www.linkedin.com/in/larissa-adomaitis-padovese-4b16381bb/",
  },
};

// Ordem de exibição (ex.: cards do /sobre-nos).
export const AUTORES_LISTA: Autor[] = [AUTORES.filipi, AUTORES.larissa];

export const AUTOR_PADRAO = "larissa";

// Resolve um id em autor, com fallback para o padrão.
export function getAutor(id?: string | null): Autor {
  return (id && AUTORES[id]) || AUTORES[AUTOR_PADRAO];
}
