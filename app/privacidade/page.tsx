import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Diarista Perto de Mim",
  robots: { index: false, follow: true },
};

const secoes = [
  {
    titulo: "1. Quem é o responsável (controlador)",
    texto:
      "O tratamento dos dados é feito por Filipi Padovese Germano da Silva LTDA, responsável pelo Diarista Perto de Mim. Contato: contato@diaristapertodemim.com.br.",
  },
  {
    titulo: "2. Quais dados coletamos",
    texto:
      "Do Cliente: nome, número de WhatsApp, bairro/região e detalhes do serviço solicitado.\nDa Diarista: nome completo, número de WhatsApp, foto, apresentação, serviços oferecidos e áreas de atendimento.\nDe todos: dados de navegação, como endereço IP e informações de cookies.",
  },
  {
    titulo: "3. Para que usamos os dados",
    texto:
      "Para conectar Clientes e Diaristas, operar e melhorar a Plataforma, manter a segurança, nos comunicarmos com você e cumprir obrigações legais.",
  },
  {
    titulo: "4. Base legal",
    texto:
      "Tratamos os dados com base no consentimento, na execução de procedimentos preliminares e do contrato de uso, e no legítimo interesse de operar o serviço de conexão.",
  },
  {
    titulo: "5. Compartilhamento de dados (importante)",
    texto:
      "Para que a conexão funcione, os dados de contato do Cliente (como nome, WhatsApp e o pedido) são compartilhados com a Diarista ou Diaristas selecionadas para atender a solicitação. Esse é o objetivo principal da Plataforma e, ao enviar seus dados, o Cliente concorda com esse compartilhamento. Também usamos provedores de tecnologia (hospedagem e infraestrutura) que podem processar dados em nosso nome. Não vendemos dados pessoais a terceiros.",
  },
  {
    titulo: "6. Transferência internacional",
    texto:
      "Alguns provedores de tecnologia que utilizamos podem armazenar dados em servidores fora do Brasil, sempre com medidas de proteção adequadas.",
  },
  {
    titulo: "7. Cookies",
    texto:
      "Usamos cookies para o funcionamento do site e para entender como ele é utilizado. Você pode gerenciar os cookies nas configurações do seu navegador.",
  },
  {
    titulo: "8. Seus direitos",
    texto:
      "Conforme a LGPD, você pode solicitar a confirmação do tratamento, o acesso, a correção, a anonimização ou a exclusão dos seus dados, a portabilidade, e revogar o consentimento a qualquer momento. Para exercer esses direitos, entre em contato pelo e-mail informado acima.",
  },
  {
    titulo: "9. Retenção e segurança",
    texto:
      "Guardamos os dados apenas pelo tempo necessário às finalidades acima ou ao cumprimento de obrigações legais, e adotamos medidas de segurança para protegê-los.",
  },
  {
    titulo: "10. Alterações",
    texto:
      "Esta Política pode ser atualizada. A versão vigente é sempre a publicada nesta página.",
  },
];

export default function Privacidade() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
        Diarista Perto de Mim
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Política de Privacidade
      </h1>
      <p className="mt-3 text-sm text-ink/50">Última atualização: 30 de junho de 2026</p>

      <p className="mt-6 leading-relaxed text-ink/70">
        Esta Política explica como tratamos os dados pessoais de Clientes e Diaristas, em
        conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).
      </p>

      <div className="mt-8 space-y-8">
        {secoes.map((s) => (
          <div key={s.titulo}>
            <h2 className="font-display text-lg font-bold text-ink">{s.titulo}</h2>
            <p className="mt-2 leading-relaxed text-ink/70 whitespace-pre-line">{s.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
