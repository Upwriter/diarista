// Páginas de SEO por palavra-chave, sob /servicos/. Cada keyword tem UM molde
// com o marcador {local}, preenchido conforme a camada (raiz / cidade / bairro).
// Linguagem de CONEXÃO, sem prometer qualidade/preço/resultado e sem citar
// valores numéricos.

export interface BlocoKw { tituloTpl: string; textoTpl: string }

export interface KeywordPagina {
  slug: string;
  nome: string; // curto, para breadcrumb e Service (JSON-LD)
  h1Tpl: string;
  aberturaTpl: string;
  blocos: BlocoKw[];
  fechamentoTpl: string;
}

export const KEYWORDS: KeywordPagina[] = [
  {
    slug: "domestica-empregada",
    nome: "Empregada doméstica e diarista",
    h1Tpl: "Empregada doméstica e diarista: qual a diferença e como encontrar {local}",
    aberturaTpl:
      'Muita gente usa "empregada doméstica" e "diarista" como se fossem a mesma coisa, mas há uma diferença importante. A empregada doméstica costuma ter vínculo de emprego (carteira assinada, jornada fixa numa mesma casa), enquanto a diarista é autônoma e atende de forma avulsa ou em alguns dias combinados, sem vínculo empregatício. Se o que você procura é alguém para cuidar da limpeza da casa sem os compromissos de uma contratação formal, uma diarista {local} costuma ser o caminho mais simples.',
    blocos: [
      {
        tituloTpl: "Entenda a diferença",
        textoTpl:
          "A empregada doméstica registrada segue as regras da legislação trabalhista específica da categoria, com direitos como férias, 13º e recolhimentos. Já a diarista trabalha por conta própria, combina seus próprios dias e valores, e atende várias casas diferentes. Para quem precisa de ajuda pontual ou algumas vezes por semana — sem assumir o papel de empregador — a diarista autônoma é geralmente a opção mais prática.",
      },
      {
        tituloTpl: "Como encontrar",
        textoTpl:
          "O Diarista Perto de Mim conecta você a profissionais autônomas disponíveis {local}. Você conta o que precisa, e mostramos diaristas que atendem a sua região — o combinado de dias, tarefas e valores fica diretamente entre você e a profissional. Não empregamos as diaristas nem prestamos o serviço de limpeza: fazemos a apresentação entre quem precisa e quem trabalha por conta própria.",
      },
    ],
    fechamentoTpl:
      "Conte para a Cida o que você precisa. Ela conecta você a profissionais disponíveis {local}, e você combina o resto direto com a diarista.",
  },
  {
    slug: "empresa-de-faxineiras",
    nome: "Empresa de faxineiras",
    h1Tpl: "Procurando uma empresa de faxineiras {local}? Veja como funciona",
    aberturaTpl:
      'Quem procura uma "empresa de faxineiras" geralmente quer uma forma prática e confiável de encontrar quem faça a limpeza da casa. Vale saber que existe uma alternativa às empresas tradicionais: plataformas que conectam você diretamente a faxineiras e diaristas autônomas {local}, sem intermediários no meio do serviço.',
    blocos: [
      {
        tituloTpl: "Como funciona (e o que somos)",
        textoTpl:
          "O Diarista Perto de Mim não é uma empresa de faxineiras — ou seja, não temos faxineiras contratadas e não prestamos o serviço de limpeza. O que fazemos é conectar você a profissionais autônomas que atendem a sua região. Cada faxineira é independente, define a própria forma de trabalho e combina os valores diretamente com você. Essa diferença é importante: em vez de contratar uma empresa, você fala direto com a profissional, com mais transparência sobre quem vai até a sua casa.",
      },
      {
        tituloTpl: "Vantagens de falar direto com a profissional",
        textoTpl:
          "Ao se conectar diretamente com a diarista ou faxineira, você combina exatamente o que precisa — dia, tarefas e valores — sem passar por uma central. É uma forma mais direta e pessoal de organizar a limpeza da casa {local}.",
      },
    ],
    fechamentoTpl:
      "Diga para a Cida o que você precisa. Ela conecta você a profissionais disponíveis {local}, e o combinado fica direto entre você e a profissional.",
  },
  {
    slug: "faxineira-perto-de-mim",
    nome: "Faxineira perto de mim",
    h1Tpl: "Faxineira perto de você {local}",
    aberturaTpl:
      "Quando a casa precisa de uma limpeza mais pesada, encontrar uma faxineira que atenda a sua região faz toda a diferença. A faxina vai além da limpeza do dia a dia: alcança cantos, vidros, rodapés e áreas que costumam ficar para depois. E quanto mais perto a profissional estiver de você, mais fácil combinar horários e o deslocamento.",
    blocos: [
      {
        tituloTpl: "O que a faxineira faz",
        textoTpl:
          "A faxina é um trabalho mais detalhado e profundo: limpeza de janelas, box do banheiro, azulejos, atrás dos móveis e outros pontos que acumulam sujeira com o tempo. Cada profissional combina com você o que está incluído, já que cada uma tem sua forma de trabalhar.",
      },
      {
        tituloTpl: "Como encontrar {local}",
        textoTpl:
          "O Diarista Perto de Mim conecta você a profissionais disponíveis {local}. Você conta o que precisa e mostramos faxineiras e diaristas autônomas que atendem a sua região. Não prestamos o serviço nem empregamos as profissionais — fazemos a apresentação, e você combina os detalhes diretamente com ela.",
      },
    ],
    fechamentoTpl:
      "Fale com a Cida sobre o que você precisa. Ela conecta você a profissionais disponíveis {local}, e você acerta os detalhes direto com a profissional.",
  },
  {
    slug: "cozinheira-diarista-valor",
    nome: "Cozinheira diarista: valor",
    h1Tpl: "Cozinheira diarista {local}: como funciona o valor do serviço",
    aberturaTpl:
      "Quem procura uma cozinheira diarista costuma querer entender como funciona o valor. A cozinheira diarista é uma profissional autônoma que prepara refeições na sua casa, e o preço do serviço depende de alguns fatores — vale entender antes de contratar.",
    blocos: [
      {
        tituloTpl: "Como funciona o valor",
        textoTpl:
          "O valor de uma cozinheira diarista varia conforme o tempo de trabalho, a quantidade de refeições, o cardápio combinado e a forma de trabalho de cada profissional. Como cada uma é autônoma, é ela quem define os próprios valores — o combinado de preço acontece sempre diretamente entre você e a cozinheira, antes do serviço. O Diarista Perto de Mim não define nem interfere nesses valores; apenas conecta você à profissional.",
      },
      {
        tituloTpl: "O que o serviço envolve",
        textoTpl:
          "O preparo pode incluir o almoço do dia, marmitas para a semana ou pratos para uma ocasião específica, conforme o combinado com a família. Cada profissional ajusta o cardápio às preferências da casa.",
      },
    ],
    fechamentoTpl:
      "Conte para a Cida o que você precisa. Ela conecta você a profissionais disponíveis {local}, e você acerta o cardápio e o valor direto com a cozinheira.",
  },
  {
    slug: "cozinheira-diarista",
    nome: "Cozinheira diarista",
    h1Tpl: "Cozinheira diarista {local}: refeições caseiras na sua casa",
    aberturaTpl:
      "A cozinheira diarista é a profissional autônoma que vai até a sua casa preparar refeições no dia a dia, sem vínculo de emprego. Para famílias que querem manter uma alimentação caseira mas não têm tempo de cozinhar, é uma ajuda que organiza a rotina e a mesa.",
    blocos: [
      {
        tituloTpl: "O que faz",
        textoTpl:
          "O serviço envolve o preparo de refeições conforme o combinado com a família: o almoço do dia, marmitas para a semana ou pratos para uma ocasião. Cada profissional tem seu estilo e combina diretamente com você o cardápio, as preferências e a forma de trabalho.",
      },
      {
        tituloTpl: "Como encontrar {local}",
        textoTpl:
          "O Diarista Perto de Mim conecta você a cozinheiras e diaristas autônomas disponíveis {local}. Você conta o que precisa e mostramos profissionais que atendem a sua região. Não empregamos as profissionais nem prestamos o serviço — a combinação de cardápio, dias e valores fica direto entre você e a cozinheira.",
      },
    ],
    fechamentoTpl:
      "Conte para a Cida o que você precisa. Ela conecta você a profissionais disponíveis {local}, e você acerta o cardápio e os detalhes direto com a cozinheira.",
  },
  {
    slug: "passadeira-de-roupas-domiciliar",
    nome: "Passadeira de roupas a domicílio",
    h1Tpl: "Passadeira de roupas a domicílio {local}",
    aberturaTpl:
      'Passar roupa é uma das tarefas domésticas que mais tomam tempo. A passadeira a domicílio é a profissional autônoma que vai até a sua casa cuidar disso — camisas, roupas de cama, peças delicadas — e devolve horas da sua semana. Muita gente pesquisa "valor" ao procurar esse serviço, e vale saber como isso funciona.',
    blocos: [
      {
        tituloTpl: "Como funciona o valor",
        textoTpl:
          "O valor do serviço de passadeira varia conforme a quantidade de roupa, a frequência e a forma de trabalho de cada profissional. Como cada passadeira é autônoma, é ela quem define os próprios valores — por isso o combinado de preço acontece sempre diretamente entre você e a profissional, com transparência, antes do serviço. O Diarista Perto de Mim não define nem interfere nesses valores.",
      },
      {
        tituloTpl: "Como encontrar {local}",
        textoTpl:
          "Conectamos você a passadeiras e diaristas autônomas disponíveis {local}. Você conta o que precisa e mostramos profissionais que atendem a sua região. Não prestamos o serviço nem empregamos as profissionais — fazemos a apresentação, e o combinado fica entre você e ela.",
      },
    ],
    fechamentoTpl:
      "Fale com a Cida sobre o que você precisa. Ela conecta você a profissionais disponíveis {local}, e você combina tudo, inclusive o valor, direto com a passadeira.",
  },
  {
    slug: "faxineira-urgente",
    nome: "Faxineira urgente",
    h1Tpl: "Preciso de uma faxineira urgente {local}",
    aberturaTpl:
      "Às vezes a necessidade aparece de última hora: uma visita inesperada, um imprevisto, a casa que precisa ficar em ordem rápido. Se você precisa de uma faxineira com urgência {local}, o caminho mais rápido é se conectar diretamente com profissionais autônomas que atendem a sua região e falar com elas na hora.",
    blocos: [
      {
        tituloTpl: "Como agilizar",
        textoTpl:
          "Quanto mais claro você for sobre o que precisa — o tipo de limpeza, o tamanho do imóvel e quando — mais rápido a conexão acontece. Ao falar direto com a profissional pelo WhatsApp, você confirma a disponibilidade dela para o dia que precisa, sem intermediários que atrasam o processo.",
      },
      {
        tituloTpl: "Como encontrar {local}",
        textoTpl:
          "O Diarista Perto de Mim conecta você a faxineiras e diaristas autônomas disponíveis {local}. Você conta o que precisa e mostramos profissionais da sua região para você falar diretamente. Lembrando que a disponibilidade para atendimento urgente depende de cada profissional — não prestamos o serviço nem garantimos horários, apenas fazemos a conexão.",
      },
    ],
    fechamentoTpl:
      "Diga para a Cida o que você precisa e para quando. Ela conecta você a profissionais disponíveis {local}, e você confirma a disponibilidade direto com a profissional.",
  },
  {
    slug: "o-que-uma-faxineira-deve-limpar",
    nome: "O que uma faxineira deve limpar",
    h1Tpl: "O que uma faxineira costuma limpar {local}",
    aberturaTpl:
      "Antes de contratar, é comum querer saber o que está incluído no trabalho de uma faxineira. Não existe uma regra única — cada profissional tem sua forma de trabalhar e combina o serviço com você — mas dá para entender o que a faxina costuma abranger na maioria dos casos.",
    blocos: [
      {
        tituloTpl: "O que a faxina costuma incluir",
        textoTpl:
          "Em geral, a faxina abrange a limpeza mais profunda da casa: pisos, banheiros, cozinha, vidros e janelas, rodapés, azulejos, box, tirar pó e limpeza atrás e embaixo dos móveis. Tarefas como passar roupa, cozinhar ou cuidar de crianças normalmente não fazem parte da faxina comum e, quando necessárias, são combinadas à parte com a profissional.",
      },
      {
        tituloTpl: "Combine sempre com a profissional",
        textoTpl:
          "Como cada faxineira é autônoma, o que está ou não incluído no serviço deve ser combinado diretamente entre vocês antes do trabalho começar. Assim ficam claras as expectativas dos dois lados. O Diarista Perto de Mim conecta você a profissionais disponíveis {local}, mas não define o escopo do serviço — isso é acertado entre você e a faxineira.",
      },
    ],
    fechamentoTpl:
      "Conte para a Cida o que você precisa que seja feito. Ela conecta você a profissionais disponíveis {local}, e você alinha as tarefas direto com a profissional.",
  },
  {
    slug: "passadeira-de-roupa-a-domicilio",
    nome: "Passadeira de roupa a domicílio",
    h1Tpl: "Passadeira de roupa a domicílio {local}",
    aberturaTpl:
      "A passadeira a domicílio é a profissional autônoma que vai até a sua casa para passar as roupas da família. Para quem não tem tempo ou paciência para o ferro, é uma forma prática de manter as roupas em ordem sem sair de casa.",
    blocos: [
      {
        tituloTpl: "O que faz",
        textoTpl:
          "O serviço foca em passar as roupas da casa — camisas, calças, roupas de cama, peças delicadas — e muitas profissionais também dobram e organizam as peças ao final. A quantidade e a forma de trabalho você combina diretamente com a passadeira.",
      },
      {
        tituloTpl: "Como encontrar {local}",
        textoTpl:
          "O Diarista Perto de Mim conecta você a passadeiras e diaristas autônomas disponíveis {local}. Você conta o que precisa e mostramos profissionais que atendem a sua região. Não prestamos o serviço nem empregamos as profissionais — fazemos a apresentação, e você combina os detalhes diretamente com ela.",
      },
    ],
    fechamentoTpl:
      "Fale com a Cida sobre o que você precisa. Ela conecta você a profissionais disponíveis {local}, e você acerta os detalhes direto com a passadeira.",
  },
];

// Preenche o marcador {local}.
export function preencherLocal(tpl: string, local: string): string {
  return tpl.split("{local}").join(local);
}

// Lista de slugs de keyword, ordenada da MAIS LONGA para a mais curta —
// essencial para identificar a keyword correta no início do slug
// (ex.: "cozinheira-diarista-valor" antes de "cozinheira-diarista").
const KEYWORDS_POR_TAMANHO = [...KEYWORDS].sort((a, b) => b.slug.length - a.slug.length);

export function identificarKeyword(pageSlug: string): { kw: KeywordPagina; resto: string } | null {
  for (const kw of KEYWORDS_POR_TAMANHO) {
    if (pageSlug === kw.slug) return { kw, resto: "" };
    if (pageSlug.startsWith(kw.slug + "-")) {
      return { kw, resto: pageSlug.slice(kw.slug.length + 1) };
    }
  }
  return null;
}
