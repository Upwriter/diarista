-- =====================================================================
-- Log de aceites de ALTERAÇÃO de assinatura (serviços adicionais)
-- Cada vez que a diarista confirma adicionar/remover um serviço adicional
-- no /painel, gravamos um comprovante: quem, quando (servidor), qual valor
-- total novo, o proporcional cobrado (quando houver), o IP e a FRASE EXATA
-- que ela viu e confirmou no modal.
--
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- Cada confirmação é um registro NOVO (nunca sobrescreve os anteriores).
-- =====================================================================

create table if not exists aceites_alteracao_assinatura (
  id                          uuid primary key default gen_random_uuid(),
  diarista_id                 uuid references diaristas(id) on delete cascade,
  tipo                        text not null,        -- 'adicionar_servico' | 'remover_servico'
  servico_slug                text,                 -- serviço afetado
  valor_total_novo_centavos   integer not null,     -- mensalidade resultante (ex.: 2480)
  valor_proporcional_centavos integer,              -- cobrado na hora, quando houver (nullable)
  texto_confirmacao           text,                 -- frase EXATA exibida no modal e confirmada
  data_hora                   timestamptz not null, -- carimbo do servidor
  ip                          text,                 -- IP capturado no servidor
  user_agent                  text,                 -- navegador (reforça a prova)
  criado_em                   timestamptz not null default now()
);

create index if not exists idx_aceites_alt_diarista
  on aceites_alteracao_assinatura (diarista_id);

alter table aceites_alteracao_assinatura enable row level security;

-- A diarista pode ler apenas os PRÓPRIOS registros.
drop policy if exists "diarista le suas alteracoes" on aceites_alteracao_assinatura;
create policy "diarista le suas alteracoes" on aceites_alteracao_assinatura
  for select using (
    exists (
      select 1 from diaristas d
      where d.id = aceites_alteracao_assinatura.diarista_id and d.user_id = auth.uid()
    )
  );

-- O admin pode ler todos.
drop policy if exists "admin le alteracoes" on aceites_alteracao_assinatura;
create policy "admin le alteracoes" on aceites_alteracao_assinatura
  for select using (auth.jwt() ->> 'email' = 'contato@upwriter.com.br');

-- Inserção é feita apenas no servidor (service_role), que ignora o RLS.
-- Por isso não há policy de INSERT para usuários comuns.
