-- =====================================================================
-- Rastreamento de conversas da Cida + funil de acompanhamento
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- =====================================================================

-- 1) Conversas com a Cida ----------------------------------------------
create table if not exists conversas_chat (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid references leads(id) on delete set null,
  mensagens            jsonb not null default '[]'::jsonb,
  iniciada_em          timestamptz not null default now(),
  ultima_atividade_em  timestamptz not null default now()
);
create index if not exists idx_conversas_ultima_atividade on conversas_chat (ultima_atividade_em desc);

-- RLS: apenas o admin lê; inserção/atualização só via service_role (bypassa RLS).
alter table conversas_chat enable row level security;
drop policy if exists "admin le conversas" on conversas_chat;
create policy "admin le conversas" on conversas_chat
  for select using (auth.jwt() ->> 'email' = 'contato@upwriter.com.br');

-- 2) Cliques em perfil de diarista a partir do chat --------------------
create table if not exists cliques_perfil (
  id           uuid primary key default gen_random_uuid(),
  diarista_id  uuid references diaristas(id) on delete cascade,
  conversa_id  uuid references conversas_chat(id) on delete set null,
  criado_em    timestamptz not null default now()
);
create index if not exists idx_cliques_perfil_conversa on cliques_perfil (conversa_id);

alter table cliques_perfil enable row level security;
drop policy if exists "admin le cliques_perfil" on cliques_perfil;
create policy "admin le cliques_perfil" on cliques_perfil
  for select using (auth.jwt() ->> 'email' = 'contato@upwriter.com.br');

-- 3) Vincular clique de WhatsApp à conversa ----------------------------
alter table cliques_whatsapp add column if not exists conversa_id uuid
  references conversas_chat(id) on delete set null;
create index if not exists idx_cliques_whatsapp_conversa on cliques_whatsapp (conversa_id);
