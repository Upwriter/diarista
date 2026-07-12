-- =====================================================================
-- Aceites de contrato (assinatura digital) — registro histórico
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- Cada aceite é um registro NOVO (nunca sobrescreve os anteriores).
-- =====================================================================

create table if not exists aceites_contrato (
  id                   uuid primary key default gen_random_uuid(),
  diarista_id          uuid references diaristas(id) on delete cascade,
  plano                text not null,                 -- 'gratuito' | 'profissional'
  versao_contrato      text not null,                 -- ex.: '2025-07-v1'
  nome_assinante       text not null,
  documento_assinante  text,                          -- CPF ou CNPJ informado
  texto_contrato       text not null,                 -- cópia EXATA do texto aceito, com campos preenchidos
  data_hora_aceite     timestamptz not null,          -- carimbo do servidor
  ip_aceite            text,                          -- IP capturado no servidor
  criado_em            timestamptz not null default now()
);

create index if not exists idx_aceites_diarista on aceites_contrato (diarista_id);

alter table aceites_contrato enable row level security;

-- A diarista pode ler apenas os PRÓPRIOS aceites.
drop policy if exists "diarista le seus aceites" on aceites_contrato;
create policy "diarista le seus aceites" on aceites_contrato
  for select using (
    exists (
      select 1 from diaristas d
      where d.id = aceites_contrato.diarista_id and d.user_id = auth.uid()
    )
  );

-- O admin pode ler todos.
drop policy if exists "admin le aceites" on aceites_contrato;
create policy "admin le aceites" on aceites_contrato
  for select using (auth.jwt() ->> 'email' = 'contato@upwriter.com.br');

-- Inserção é feita apenas no servidor (service_role), que ignora o RLS.
-- Por isso não há policy de INSERT para usuários comuns.
