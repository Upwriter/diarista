-- =====================================================================
-- Autor dos posts do blog
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- =====================================================================

-- Coluna "autor" com padrão "larissa".
alter table posts_blog add column if not exists autor text not null default 'larissa';

-- Garante que os posts JÁ existentes fiquem com Larissa como autora.
update posts_blog set autor = 'larissa' where autor is null or autor = '';
