-- =====================================================================
-- Diarista Perto de Mim — esquema do banco (Supabase / PostgreSQL)
-- Como usar: Supabase > SQL Editor > cole tudo > Run.
-- =====================================================================

-- Extensão para gerar IDs
create extension if not exists "pgcrypto";

-- ---------- Bairros (espelho da lista do site, para o chatbot consultar)
create table if not exists bairros (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null,
  slug  text not null unique,
  zona  text not null
);

-- ---------- Serviços (começamos só com "diarista")
create table if not exists servicos (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null,
  slug  text not null unique
);

-- ---------- Diaristas (profissionais cadastradas)
create table if not exists diaristas (
  id            uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  whatsapp      text not null,
  foto_url      text,
  apresentacao  text,
  plano         text not null default 'free' check (plano in ('free', 'pago')),
  ativo         boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- Quais bairros cada diarista atende (muitos-para-muitos)
create table if not exists diarista_bairros (
  diarista_id uuid references diaristas(id) on delete cascade,
  bairro_id   uuid references bairros(id) on delete cascade,
  primary key (diarista_id, bairro_id)
);

-- ---------- Quais serviços cada diarista faz (muitos-para-muitos)
create table if not exists diarista_servicos (
  diarista_id uuid references diaristas(id) on delete cascade,
  servico_id  uuid references servicos(id) on delete cascade,
  primary key (diarista_id, servico_id)
);

-- ---------- Leads (clientes captados pelo site/chatbot)
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  nome        text,
  whatsapp    text,
  bairro_id   uuid references bairros(id),
  servico_id  uuid references servicos(id),
  detalhes    text,
  origem      text,            -- ex.: slug da página de onde veio
  created_at  timestamptz not null default now()
);

-- ---------- Entrega do lead para diaristas (sem exclusividade)
create table if not exists lead_assignments (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete cascade,
  diarista_id uuid references diaristas(id) on delete cascade,
  status      text not null default 'enviado',
  created_at  timestamptz not null default now()
);

create index if not exists idx_diarista_bairros_bairro on diarista_bairros(bairro_id);
create index if not exists idx_leads_bairro on leads(bairro_id);

-- =====================================================================
-- SEGURANÇA (RLS). Ligamos em tudo e liberamos só o necessário.
-- Bairros e serviços são públicos (leitura). O resto fica fechado e
-- será acessado pelo backend com a service_role key (nunca exposta no site).
-- =====================================================================
alter table bairros            enable row level security;
alter table servicos           enable row level security;
alter table diaristas          enable row level security;
alter table diarista_bairros   enable row level security;
alter table diarista_servicos  enable row level security;
alter table leads              enable row level security;
alter table lead_assignments   enable row level security;

-- Leitura pública de bairros e serviços (são dados de referência)
create policy "bairros leitura publica"  on bairros  for select using (true);
create policy "servicos leitura publica" on servicos for select using (true);

-- Perfis de diaristas ativas são públicos (aparecem no site na Fase 3)
create policy "diaristas ativas publicas" on diaristas
  for select using (ativo = true);
