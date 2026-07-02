-- =====================================================================
-- CMS do blog — tabela de posts
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- =====================================================================

create table if not exists posts_blog (
  id               uuid primary key default gen_random_uuid(),
  titulo           text not null,
  slug             text not null unique,
  meta_descricao   text,
  imagem_capa_url  text,
  conteudo_html    text not null,
  status           text not null default 'rascunho' check (status in ('rascunho','publicado')),
  data_publicacao  timestamptz,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create index if not exists idx_posts_blog_status_data
  on posts_blog (status, data_publicacao desc);

alter table posts_blog enable row level security;

-- Admin gerencia tudo (o servidor usa service_role, que bypassa o RLS,
-- mas mantemos a policy para acesso direto autenticado como admin).
drop policy if exists "admin gerencia posts" on posts_blog;
create policy "admin gerencia posts" on posts_blog
  for all using (auth.jwt() ->> 'email' = 'contato@upwriter.com.br')
  with check (auth.jwt() ->> 'email' = 'contato@upwriter.com.br');

-- Qualquer um pode ler apenas os publicados.
drop policy if exists "qualquer um le publicados" on posts_blog;
create policy "qualquer um le publicados" on posts_blog
  for select using (status = 'publicado');
