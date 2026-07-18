// Emails transacionais (Resend). SOMENTE servidor.
// Regra de ouro: TODO envio é best-effort — nunca lança, nunca derruba/atrasa a
// ação principal (cadastro, pagamento, redirect do WhatsApp).
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const FROM = "Diarista Perto de Mim <contato@diaristapertodemim.com.br>";
const PAINEL = "https://www.diaristapertodemim.com.br/painel";

const RODAPE =
  "Diarista Perto de Mim — plataforma de conexão entre clientes e diaristas autônomas. " +
  "CNPJ 53.312.965/0001-86. Não somos empregadores nem prestamos serviço de limpeza. " +
  "Você recebeu este e-mail porque tem um cadastro no Diarista Perto de Mim.";

// Resolve o email da diarista via auth.users (não está na tabela diaristas).
export async function emailDaDiarista(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data?.user?.email ?? null;
  } catch (e) {
    console.error("[email] falha ao resolver email da diarista:", e instanceof Error ? e.message : e);
    return null;
  }
}

// Envelope HTML padrão (responsivo, cores da marca discretas + rodapé).
function layout(corpo: string): string {
  return `<div style="background:#f7f5f0;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e9e7;border-radius:14px;overflow:hidden;">
    <div style="height:6px;background:#0E6B5C;"></div>
    <div style="padding:26px 28px 6px;">
      <p style="margin:0 0 18px;font-size:17px;font-weight:bold;color:#0E6B5C;">Diarista Perto de Mim</p>
      ${corpo}
    </div>
    <div style="border-top:1px solid #eee;padding:16px 28px 24px;">
      <p style="margin:0;font-size:11px;line-height:1.5;color:#9aa0a6;">${RODAPE}</p>
    </div>
  </div>
</div>`;
}

const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2b2b2b;">${t}</p>`;
const botao = (texto: string) =>
  `<p style="margin:18px 0 22px;"><a href="${PAINEL}" style="display:inline-block;background:#0E6B5C;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;">${texto}</a></p>`;
const assinatura = `<p style="margin:18px 0 8px;font-size:15px;line-height:1.6;color:#2b2b2b;">Equipe Diarista Perto de Mim 💚</p>`;

async function enviar(para: string | null, assunto: string, html: string): Promise<void> {
  try {
    if (!para || !process.env.RESEND_API_KEY) return;
    const { error } = await resend.emails.send({ from: FROM, to: para, subject: assunto, html: layout(html) });
    if (error) console.error("[email] Resend retornou erro:", error);
  } catch (e) {
    console.error("[email] falha ao enviar:", e instanceof Error ? e.message : e);
  }
}

// ── 1) Cadastro Gratuito ─────────────────────────────────────────────────────
export function emailCadastroGratuito(para: string | null, nome: string): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Que bom ter você com a gente. Seu cadastro no plano Gratuito foi concluído com sucesso, e a partir de agora seu perfil pode aparecer para clientes que procuram uma diarista na sua região.") +
    p(`<strong>Como acessar sua área:</strong> é só entrar em <a href="${PAINEL}" style="color:#0E6B5C;">${PAINEL}</a> com o e-mail e a senha que você cadastrou.`) +
    p("<strong>O que você encontra no seu painel:</strong>") +
    `<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.6;color:#2b2b2b;">
      <li>Seus dados e o serviço e bairro em que você atende</li>
      <li>A opção de trocar seu serviço ou bairro quando precisar</li>
      <li>Um espaço para acompanhar sua conta</li>
    </ul>` +
    p("<strong>Como funciona:</strong> quando alguém da sua região procura uma diarista pelo nosso site, mostramos profissionais como você. O cliente então fala diretamente com você pelo WhatsApp, e vocês combinam tudo — dias, tarefas e valores. Nós fazemos a apresentação; o combinado é sempre direto entre você e o cliente.") +
    p("<strong>Uma dica:</strong> no plano Gratuito você atende 1 bairro e oferece 1 serviço. Se quiser aparecer para mais clientes, em mais bairros e com mais serviços, o plano Profissional pode ajudar — você vê os detalhes no seu painel, sem compromisso.") +
    botao("Acessar meu painel") +
    p("Qualquer dúvida, é só responder este e-mail.") +
    p("Boas-vindas! 💚") +
    assinatura;
  return enviar(para, "Bem-vinda ao Diarista Perto de Mim! 🎉", corpo);
}

// ── 2) Boas-vindas Profissional (após 1º pagamento confirmado) ───────────────
export function emailBoasVindasProfissional(para: string | null, nome: string): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Seu pagamento foi confirmado e seu plano Profissional está ativo. Seja muito bem-vinda — a partir de agora seu perfil completo pode aparecer para clientes em toda a sua região.") +
    p(`<strong>Como acessar sua área:</strong> entre em <a href="${PAINEL}" style="color:#0E6B5C;">${PAINEL}</a> com o seu e-mail e senha.`) +
    p("<strong>O que o plano Profissional te dá:</strong>") +
    `<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.6;color:#2b2b2b;">
      <li>Perfil completo, com foto principal e galeria de fotos do seu trabalho</li>
      <li>Atuação em quantos bairros você quiser dentro da sua cidade</li>
      <li>Até 3 tipos de serviço inclusos (e a opção de adicionar mais)</li>
      <li>Até 2 contatos de WhatsApp</li>
      <li>Prioridade na ordem em que os perfis são apresentados aos clientes</li>
    </ul>` +
    p("Aproveite para deixar seu perfil completo: perfis com foto e informações bem preenchidas costumam chamar mais atenção dos clientes.") +
    p("<strong>Como funciona:</strong> quando alguém procura uma diarista na sua região, mostramos seu perfil. O cliente fala diretamente com você pelo WhatsApp, e o combinado de dias, tarefas e valores fica sempre entre vocês.") +
    p("<strong>Sobre sua assinatura:</strong> você pode gerenciar seu plano, adicionar ou remover serviços e bairros, e cancelar quando quiser, tudo pelo seu painel. Não há fidelidade.") +
    botao("Completar meu perfil") +
    p("Qualquer dúvida, é só responder este e-mail.") +
    p("Bem-vinda ao Profissional! 💚") +
    assinatura;
  return enviar(para, "Seu plano Profissional está ativo! 🌟", corpo);
}

// ── 3A) Lead clicou no WhatsApp — COM dados ──────────────────────────────────
export function emailLeadComDados(
  para: string | null,
  nome: string,
  leadNome: string,
  leadWhatsapp: string,
  servico: string
): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Boas notícias: um cliente acabou de se interessar pelo seu perfil e pegou seu contato para falar com você.") +
    p("<strong>Detalhes do cliente:</strong>") +
    `<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.6;color:#2b2b2b;">
      <li>Nome: <strong>${leadNome}</strong></li>
      <li>WhatsApp: <strong>${leadWhatsapp}</strong></li>
      <li>Serviço que procura: <strong>${servico}</strong></li>
    </ul>` +
    p("Ele pode entrar em contato com você pelo WhatsApp a qualquer momento — fique de olho nas suas mensagens. Se preferir, você também pode dar o primeiro passo e chamar o cliente.") +
    botao("Acompanhar no painel") +
    p("Lembrando: o combinado de dias, tarefas e valores é sempre direto entre você e o cliente.") +
    p("Bom trabalho! 💚") +
    assinatura;
  return enviar(para, "🔔 Um cliente quer falar com você!", corpo);
}

// ── 3B) Lead clicou no WhatsApp — SEM dados ──────────────────────────────────
export function emailLeadSemDados(para: string | null, nome: string): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Alguém se interessou pelo seu perfil e pegou seu contato pelo WhatsApp. Fique de olho nas suas mensagens!") +
    botao("Acompanhar no painel") +
    p("Lembrando: o combinado de dias, tarefas e valores é sempre direto entre você e o cliente.") +
    p("Bom trabalho! 💚") +
    assinatura;
  return enviar(para, "🔔 Alguém se interessou pelo seu perfil!", corpo);
}

// ── 4A) Pagamento confirmado (renovação) ─────────────────────────────────────
export function emailPagamentoConfirmado(para: string | null, nome: string): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Confirmamos o pagamento da sua assinatura do plano Profissional. Está tudo certo — seu perfil segue ativo e aparecendo para clientes na sua região.") +
    p(`Você pode ver os detalhes da sua assinatura a qualquer momento no seu painel: <a href="${PAINEL}" style="color:#0E6B5C;">${PAINEL}</a>`) +
    botao("Ver minha assinatura") +
    p("Obrigado por fazer parte do Diarista Perto de Mim! 💚") +
    assinatura;
  return enviar(para, "Pagamento confirmado — plano Profissional ✅", corpo);
}

// ── 4B) Falha no pagamento ───────────────────────────────────────────────────
export function emailFalhaPagamento(para: string | null, nome: string): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Tentamos processar o pagamento da sua assinatura do plano Profissional, mas não conseguimos desta vez. Isso costuma acontecer por algum problema com o cartão (limite, validade ou dados desatualizados).") +
    p(`<strong>O que fazer:</strong> acesse seu painel em <a href="${PAINEL}" style="color:#0E6B5C;">${PAINEL}</a> para verificar sua forma de pagamento. Assim que o pagamento for regularizado, seu plano Profissional continua normalmente.`) +
    botao("Verificar pagamento") +
    p("Se precisar de ajuda, é só responder este e-mail.") +
    assinatura;
  return enviar(para, "Não conseguimos processar seu pagamento ⚠️", corpo);
}

// ── 4C) Cancelamento solicitado ──────────────────────────────────────────────
export function emailCancelamentoSolicitado(para: string | null, nome: string): Promise<void> {
  const corpo =
    p(`Olá, <strong>${nome}</strong>!`) +
    p("Confirmamos seu pedido de cancelamento do plano Profissional. Sem problema algum — e obrigado por ter usado o plano até aqui.") +
    p("<strong>Como fica:</strong> você mantém os benefícios do plano Profissional até o fim do período já pago. Depois dessa data, seu perfil volta automaticamente ao plano Gratuito, sem novas cobranças. Você não perde sua conta — continua aparecendo para clientes, dentro dos limites do plano Gratuito.") +
    p("<strong>Mudou de ideia?</strong> Você pode reativar seu plano a qualquer momento pelo painel.") +
    botao("Reativar meu plano") +
    p("Você é sempre bem-vinda por aqui. 💚") +
    assinatura;
  return enviar(para, "Recebemos seu pedido de cancelamento", corpo);
}
