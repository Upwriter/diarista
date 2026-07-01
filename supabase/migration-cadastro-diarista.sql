-- =====================================================================
-- Migração: cadastro de diaristas
-- Supabase > SQL Editor > cole tudo > Run.
-- =====================================================================

-- Novos campos na tabela diaristas
alter table diaristas
  add column if not exists user_id              uuid references auth.users(id) on delete set null,
  add column if not exists cpf                  text unique,
  add column if not exists whatsapp2            text,
  add column if not exists cidade               text not null default 'São Paulo',
  add column if not exists atende_todos_bairros boolean not null default false;

-- Tipos de imóvel (apartamento, casa, kitnet, etc.)
create table if not exists imoveis (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null,
  slug  text not null unique
);

-- Quais tipos de imóvel cada diarista atende
create table if not exists diarista_imoveis (
  diarista_id uuid references diaristas(id) on delete cascade,
  imovel_id   uuid references imoveis(id)   on delete cascade,
  primary key (diarista_id, imovel_id)
);

alter table imoveis          enable row level security;
alter table diarista_imoveis enable row level security;

create policy "imoveis leitura publica" on imoveis for select using (true);

-- Dados iniciais de imóveis
insert into imoveis (nome, slug) values
  ('Apartamento',        'apartamento'),
  ('Casa',               'casa'),
  ('Kitnet / Studio',    'kitnet'),
  ('Cobertura',          'cobertura'),
  ('Escritório / Sala',  'escritorio'),
  ('Sobrado',            'sobrado')
on conflict (slug) do nothing;

-- Dados iniciais de serviços (completo)
insert into servicos (nome, slug) values
  ('Limpeza de casa',     'limpeza-casa'),
  ('Faxina pesada',       'faxina-pesada'),
  ('Limpeza pós-obra',    'pos-obra'),
  ('Lava louça',          'lava-louca'),
  ('Limpa janelas',       'limpa-janelas'),
  ('Passa roupa',         'passa-roupa'),
  ('Cozinheira',          'cozinheira')
on conflict (slug) do nothing;