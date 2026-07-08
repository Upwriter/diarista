// Conteúdo das páginas de serviço. Cópia redigida seguindo as regras
// jurídicas do projeto: linguagem de CONEXÃO, sem prometer qualidade, preço
// ou resultado. Sempre "profissionais disponíveis na sua região" e
// "você combina direto com a profissional".

export interface Servico {
  slug: string;       // segmento da URL (ex.: "servico-diarista")
  imgPrefix: string;  // prefixo das imagens (ex.: "diarista")
  nome: string;       // "Diarista"
  cardFrase: string;  // frase curta do cartão no índice
  metaTitle: string;
  metaDesc: string;
  intro: string;
  oQueFaz: string[];
  quandoContratar: string[];
  alt1: string;
  alt2: string;
}

export const SERVICOS_CONTEUDO: Servico[] = [
  {
    slug: "servico-diarista",
    imgPrefix: "diarista",
    nome: "Diarista",
    cardFrase: "A limpeza do dia a dia da casa, para manter tudo em ordem.",
    metaTitle: "Diarista — limpeza do dia a dia | Diarista Perto de Mim",
    metaDesc:
      "Precisa de diarista para a limpeza do dia a dia? Conte o que você precisa e se conecte, sem custo, a profissionais disponíveis na sua região.",
    intro:
      "A diarista cuida da limpeza do dia a dia da casa — aquele serviço de manutenção que mantém os ambientes limpos, organizados e agradáveis para viver. Pelo Diarista Perto de Mim você conta o que precisa e se conecta com profissionais disponíveis na sua região, combinando todos os detalhes diretamente com a profissional.",
    oQueFaz: [
      "Limpeza geral dos cômodos: tirar o pó, varrer, aspirar e passar pano.",
      "Cuidados com a cozinha e a louça do dia a dia.",
      "Limpeza dos banheiros e organização leve dos ambientes.",
      "Manutenção da casa em ordem, no ritmo que você combinar com a profissional.",
    ],
    quandoContratar: [
      "Para manter a casa em ordem com regularidade — de forma avulsa, semanal ou quinzenal.",
      "Quando a rotina fica corrida e o dia a dia da limpeza pesa.",
      "Antes de receber visitas ou depois de um fim de semana movimentado.",
    ],
    alt1: "Diarista fazendo a limpeza da sala de uma casa",
    alt2: "Diarista organizando e limpando um ambiente da casa",
  },
  {
    slug: "faxineira",
    imgPrefix: "faxineira",
    nome: "Faxineira",
    cardFrase: "A faxina pesada e a limpeza mais profunda da casa.",
    metaTitle: "Faxineira — faxina pesada e limpeza profunda | Diarista Perto de Mim",
    metaDesc:
      "Precisa de faxineira para uma limpeza pesada? Conte o que você precisa e se conecte, sem custo, a profissionais disponíveis na sua região.",
    intro:
      "A faxineira é indicada para a limpeza mais profunda e detalhada — a chamada faxina pesada, que vai além da manutenção do dia a dia. Pelo Diarista Perto de Mim você descreve o que precisa e se conecta com profissionais disponíveis na sua região, acertando valor, dia e detalhes diretamente com a profissional.",
    oQueFaz: [
      "Limpeza pesada e detalhada de cozinha e banheiros.",
      "Remoção de sujeira acumulada, gordura e áreas de difícil acesso.",
      "Limpeza de janelas, rodapés, azulejos e cantos que a rotina não alcança.",
      "Aquela arrumação completa, cômodo por cômodo.",
    ],
    quandoContratar: [
      "Em mudanças, ao entrar ou sair de um imóvel.",
      "Quando a casa precisa de uma limpeza mais profunda que a do dia a dia.",
      "Antes ou depois de festas, reuniões e datas especiais.",
    ],
    alt1: "Faxineira limpando o vidro de uma janela",
    alt2: "Faxineira fazendo a limpeza pesada de um banheiro",
  },
  {
    slug: "passadeira",
    imgPrefix: "passadeira",
    nome: "Passadeira",
    cardFrase: "Passar e organizar as roupas, sem acúmulo na cesta.",
    metaTitle: "Passadeira de roupa | Diarista Perto de Mim",
    metaDesc:
      "Precisa de quem passe as roupas? Conte o que você precisa e se conecte, sem custo, a profissionais disponíveis na sua região.",
    intro:
      "A passadeira cuida de passar e organizar as roupas da casa, deixando as peças prontas para o uso. Pelo Diarista Perto de Mim você conta o que precisa e se conecta com profissionais disponíveis na sua região, combinando tudo diretamente com a profissional.",
    oQueFaz: [
      "Passar as roupas do dia a dia da família.",
      "Cuidar de camisas, peças sociais e roupas mais delicadas.",
      "Dobrar e organizar as peças depois de passadas.",
      "Ajudar a colocar em ordem aquela cesta de roupa que se acumula.",
    ],
    quandoContratar: [
      "Quando a roupa passada se acumula e falta tempo na rotina.",
      "Para deixar peças prontas para uma viagem ou ocasião especial.",
      "De forma avulsa ou com uma frequência que você combina com a profissional.",
    ],
    alt1: "Passadeira passando uma camisa na tábua de passar",
    alt2: "Roupas passadas e dobradas em ordem",
  },
  {
    slug: "limpeza-pos-obra",
    imgPrefix: "limpeza-pos-obra",
    nome: "Limpeza pós-obra",
    cardFrase: "A limpeza especializada depois de obra ou reforma.",
    metaTitle: "Limpeza pós-obra | Diarista Perto de Mim",
    metaDesc:
      "Terminou a obra ou reforma? Conte o que você precisa e se conecte, sem custo, a profissionais disponíveis na sua região para a limpeza pós-obra.",
    intro:
      "A limpeza pós-obra é o serviço especializado para deixar o imóvel pronto para uso depois de uma obra ou reforma, com foco em resíduos, poeira fina e respingos de material. Pelo Diarista Perto de Mim você descreve o que precisa e se conecta com profissionais disponíveis na sua região, ajustando os detalhes diretamente com a profissional.",
    oQueFaz: [
      "Remoção da poeira fina que fica em todos os cantos após a obra.",
      "Limpeza de respingos de tinta, cimento e outros materiais.",
      "Limpeza de pisos, vidros, box e áreas molhadas.",
      "A arrumação final para o ambiente ficar pronto para morar.",
    ],
    quandoContratar: [
      "Logo após uma reforma, construção ou pintura.",
      "Antes de mobiliar ou de se mudar para o imóvel.",
      "Quando a poeira e os resíduos de obra pedem uma limpeza especializada.",
    ],
    alt1: "Limpeza detalhada de um ambiente após uma obra",
    alt2: "Ambiente limpo e organizado depois da limpeza pós-obra",
  },
  {
    slug: "cozinheira",
    imgPrefix: "cozinheira",
    nome: "Cozinheira",
    cardFrase: "O preparo das refeições no conforto da sua casa.",
    metaTitle: "Cozinheira — preparo de refeições em casa | Diarista Perto de Mim",
    metaDesc:
      "Precisa de cozinheira para preparar as refeições em casa? Conte o que você precisa e se conecte, sem custo, a profissionais disponíveis na sua região.",
    intro:
      "A cozinheira cuida do preparo das refeições no conforto da sua casa, conforme o seu gosto e a sua rotina. Pelo Diarista Perto de Mim você conta o que precisa e se conecta com profissionais disponíveis na sua região, combinando cardápio, dia e detalhes diretamente com a profissional.",
    oQueFaz: [
      "Preparo das refeições do dia a dia, conforme as suas preferências.",
      "Organização das marmitas e das refeições da semana.",
      "Cuidado com a cozinha e os utensílios usados no preparo.",
      "Apoio na cozinha em datas e ocasiões especiais.",
    ],
    quandoContratar: [
      "Quando falta tempo para cozinhar no dia a dia.",
      "Para deixar as refeições da semana adiantadas.",
      "Em eventos e reuniões em casa que pedem uma mão na cozinha.",
    ],
    alt1: "Cozinha organizada e pronta para o preparo das refeições",
    alt2: "Preparo de refeições no ambiente da cozinha de casa",
  },
];

export function getServico(slug: string): Servico | undefined {
  return SERVICOS_CONTEUDO.find((s) => s.slug === slug);
}
