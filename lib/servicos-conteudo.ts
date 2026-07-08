// Conteúdo das páginas de serviço (textos aprovados). Linguagem de CONEXÃO,
// sem prometer qualidade, preço ou resultado. Sempre "profissionais
// disponíveis na sua região" e "você combina direto com a profissional".

export interface Servico {
  slug: string;       // segmento da URL (ex.: "servico-diarista")
  imgPrefix: string;  // prefixo das imagens (ex.: "diarista")
  nome: string;       // "Diarista"
  cardFrase: string;  // frase curta do cartão no índice
  metaTitle: string;
  metaDesc: string;
  h1: string;
  intro: string;
  oQueFazTitulo: string;
  oQueFazTexto: string;
  quandoTitulo: string;
  quandoTexto: string;
  fechamento: string;
  alt1: string;
  alt2: string;
}

export const SERVICOS_CONTEUDO: Servico[] = [
  {
    slug: "servico-diarista",
    imgPrefix: "diarista",
    nome: "Diarista",
    cardFrase: "A faxina completa do dia a dia da casa, sem complicação.",
    metaTitle: "Diarista: a faxina completa da sua casa | Diarista Perto de Mim",
    metaDesc:
      "Precisa de diarista para a limpeza do dia a dia? Conte o que você precisa e conecte-se a profissionais disponíveis na sua região.",
    h1: "Diarista: a faxina completa da sua casa, sem complicação",
    intro:
      "A diarista é a profissional que cuida da limpeza geral da casa no dia a dia: varrer, tirar pó, lavar banheiros, cozinha, áreas comuns e deixar tudo em ordem. É o serviço mais procurado por quem quer manter a casa limpa sem abrir mão do próprio tempo — seja uma vez por semana, quinzenalmente ou de forma avulsa.",
    oQueFazTitulo: "O que a diarista costuma fazer",
    oQueFazTexto:
      "O trabalho da diarista é a limpeza de manutenção da casa: pisos, móveis, banheiros, cozinha, louças, lixo e organização leve dos ambientes. Cada profissional combina diretamente com você o que está dentro do serviço, já que cada uma tem sua própria forma de trabalhar.",
    quandoTitulo: "Quando contratar uma diarista",
    quandoTexto:
      "Vale procurar uma diarista quando a rotina não deixa tempo para dar conta da casa, quando você quer manter um padrão de limpeza sem esforço próprio, ou quando precisa de uma ajuda pontual antes ou depois de receber visitas. Também é a escolha certa para quem quer uma limpeza recorrente e previsível, sem ter que pensar nisso toda semana.",
    fechamento:
      "Conte para a Cida o que você precisa e em qual bairro você está. Ela conecta você a profissionais disponíveis na sua região, e você combina o resto direto com a diarista.",
    alt1: "Diarista tirando o pó de uma mesa na sala de estar",
    alt2: "Cozinha limpa e organizada após o serviço da diarista",
  },
  {
    slug: "faxineira",
    imgPrefix: "faxineira",
    nome: "Faxineira",
    cardFrase: "A limpeza pesada que a casa precisa de vez em quando.",
    metaTitle: "Faxineira: a limpeza pesada da casa | Diarista Perto de Mim",
    metaDesc:
      "Precisa de faxineira para uma limpeza pesada? Conte o que você precisa e conecte-se a profissionais disponíveis na sua região.",
    h1: "Faxineira: a limpeza pesada que a casa precisa de vez em quando",
    intro:
      "A faxineira é a profissional procurada para a limpeza mais profunda da casa — aquela que vai além da manutenção do dia a dia. É o serviço ideal quando a casa precisa de um cuidado mais detalhado, alcançando cantos, janelas, rodapés e áreas que a limpeza rápida costuma deixar para depois.",
    oQueFazTitulo: "O que a faxineira costuma fazer",
    oQueFazTexto:
      "A faxina é um trabalho mais intenso e detalhado: limpeza de vidros e janelas, rodapés, atrás dos móveis, azulejos, box do banheiro e outros pontos que acumulam sujeira com o tempo. É comum contratar a faxina de forma avulsa, quando a casa pede uma renovação mais completa. Os detalhes do que será feito você combina diretamente com a profissional.",
    quandoTitulo: "Quando contratar uma faxineira",
    quandoTexto:
      "A faxina costuma ser a escolha certa em momentos específicos: ao mudar de casa, depois de uma festa ou reunião, na virada das estações, antes de uma ocasião especial, ou simplesmente quando a limpeza do dia a dia já não dá conta do acúmulo. Se a sensação é de que a casa precisa “voltar ao ponto zero”, é faxina que você procura.",
    fechamento:
      "Diga para a Cida o que você precisa e onde você mora. Ela conecta você a profissionais disponíveis na sua região que atendem esse tipo de limpeza, e você acerta os detalhes direto com ela.",
    alt1: "Faxineira limpando o vidro de uma janela",
    alt2: "Faxineira fazendo a limpeza pesada de um banheiro",
  },
  {
    slug: "passadeira",
    imgPrefix: "passadeira",
    nome: "Passadeira",
    cardFrase: "Suas roupas passadas e organizadas, sem o trabalho.",
    metaTitle: "Passadeira: roupas passadas e organizadas | Diarista Perto de Mim",
    metaDesc:
      "Precisa de quem passe as roupas? Conte o que você precisa e conecte-se a profissionais disponíveis na sua região.",
    h1: "Passadeira: suas roupas passadas e organizadas, sem o trabalho",
    intro:
      "A passadeira é a profissional especializada em passar roupas — um dos serviços domésticos que mais tomam tempo e paciência. Para quem acumula cestos de roupa lavada esperando o ferro, contar com alguém que faça isso bem feito devolve horas preciosas da semana.",
    oQueFazTitulo: "O que a passadeira costuma fazer",
    oQueFazTexto:
      "O foco do serviço é passar as roupas da casa: camisas, calças, roupas de cama, peças delicadas e o que mais precisar. Muitas profissionais também organizam e dobram as peças ao final. A quantidade de roupa e a forma de trabalho você combina diretamente com a passadeira.",
    quandoTitulo: "Quando contratar uma passadeira",
    quandoTexto:
      "Vale procurar uma passadeira quando o ferro de passar virou aquela tarefa que nunca acaba, quando você tem muitas peças que exigem cuidado, ou quando prefere dedicar seu tempo livre a outras coisas. Também é útil de forma recorrente, para nunca mais deixar a roupa acumular, ou pontualmente, quando o cesto passou do limite.",
    fechamento:
      "Conte para a Cida o que você precisa e em qual bairro você está. Ela conecta você a profissionais disponíveis na sua região, e o combinado final fica entre você e a passadeira.",
    alt1: "Passadeira passando uma camisa na tábua de passar",
    alt2: "Roupas passadas e dobradas em ordem sobre a mesa",
  },
  {
    slug: "limpeza-pos-obra",
    imgPrefix: "limpeza-pos-obra",
    nome: "Limpeza pós-obra",
    cardFrase: "Tire a poeira e os resíduos depois da reforma.",
    metaTitle: "Limpeza pós-obra: tire a poeira depois da reforma | Diarista Perto de Mim",
    metaDesc:
      "Terminou a obra ou reforma? Conte o que você precisa e conecte-se a profissionais disponíveis na sua região para a limpeza pós-obra.",
    h1: "Limpeza pós-obra: tire a poeira e os resíduos depois da reforma",
    intro:
      "A limpeza pós-obra é o serviço feito para deixar o imóvel pronto para morar depois de uma construção ou reforma. É um tipo de limpeza específico, porque lida com poeira fina, respingos de tinta, restos de material e sujeira que a limpeza comum não resolve.",
    oQueFazTitulo: "O que a limpeza pós-obra costuma envolver",
    oQueFazTexto:
      "Esse serviço trata da sujeira que sobra de uma obra: poeira de cimento e gesso que se espalha por tudo, respingos de tinta e argamassa, adesivos e etiquetas em vidros e louças, e a remoção de resíduos leves deixados pela reforma. É um trabalho mais pesado que a faxina comum, e cada profissional combina com você o alcance do que será feito.",
    quandoTitulo: "Quando contratar a limpeza pós-obra",
    quandoTexto:
      "É o serviço certo logo após terminar uma reforma, construção ou pintura — seja num apartamento, casa, escritório ou espaço comercial. Antes de mobiliar ou voltar a usar o ambiente, a limpeza pós-obra remove a camada de poeira e resíduos que fica no piso, nas paredes, nos vidros e nos acabamentos.",
    fechamento:
      "Fale com a Cida sobre o que você precisa e onde é o imóvel. Ela conecta você a profissionais disponíveis na sua região que atendem esse tipo de limpeza, e você combina os detalhes diretamente com a profissional.",
    alt1: "Profissional varrendo a poeira fina no piso de um imóvel após a obra",
    alt2: "Apartamento limpo e vazio, pronto para morar depois da limpeza pós-obra",
  },
  {
    slug: "cozinheira",
    imgPrefix: "cozinheira",
    nome: "Cozinheira",
    cardFrase: "Refeições caseiras preparadas na sua casa.",
    metaTitle: "Cozinheira: refeições caseiras na sua casa | Diarista Perto de Mim",
    metaDesc:
      "Precisa de cozinheira para preparar as refeições em casa? Conte o que você precisa e conecte-se a profissionais disponíveis na sua região.",
    h1: "Cozinheira: refeições caseiras preparadas na sua casa",
    intro:
      "A cozinheira é a profissional que prepara refeições no dia a dia, na sua própria casa. Para quem não tem tempo ou disposição para cozinhar, mas quer manter uma alimentação caseira, é uma ajuda que faz diferença na rotina da família.",
    oQueFazTitulo: "O que a cozinheira costuma fazer",
    oQueFazTexto:
      "O serviço envolve o preparo de refeições caseiras conforme o combinado com a família: o almoço do dia, marmitas para a semana, ou pratos para uma ocasião específica. Cada profissional tem seu estilo e combina diretamente com você o cardápio, as preferências da casa e a forma de trabalho.",
    quandoTitulo: "Quando contratar uma cozinheira",
    quandoTexto:
      "Vale procurar uma cozinheira quando a correria do dia a dia atrapalha a alimentação da família, quando você quer marmitas prontas para a semana, ou quando precisa de ajuda no preparo de refeições para um momento especial em casa. É uma opção para quem valoriza comida caseira mas não tem tempo de prepará-la.",
    fechamento:
      "Conte para a Cida o que você precisa e em qual bairro você está. Ela conecta você a profissionais disponíveis na sua região, e você acerta o cardápio e os detalhes direto com a cozinheira.",
    alt1: "Cozinheira preparando uma refeição no fogão de uma casa",
    alt2: "Marmitas e refeições caseiras prontas sobre a mesa da cozinha",
  },
];

export function getServico(slug: string): Servico | undefined {
  return SERVICOS_CONTEUDO.find((s) => s.slug === slug);
}
