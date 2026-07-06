-- =====================================================================
-- Expansão para uma segunda cidade: Guarujá
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- =====================================================================

-- 1) Coluna cidade na tabela bairros + backfill dos 77 de São Paulo -----
alter table bairros add column if not exists cidade text;
update bairros set cidade = 'Sao Paulo' where cidade is null;
alter table bairros alter column cidade set not null;

-- Guarujá não tem zonas: permite zona nula.
alter table bairros alter column zona drop not null;

-- 2) Trocar o UNIQUE global de slug por um UNIQUE composto (cidade, slug) -
-- Remove qualquer constraint/índice único que exista APENAS sobre slug
-- (o nome varia conforme foi criado; por isso fazemos de forma dinâmica).
do $$
declare r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'bairros'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) ilike '%(slug)%'
      and pg_get_constraintdef(oid) not ilike '%cidade%'
  loop
    execute format('alter table bairros drop constraint %I', r.conname);
  end loop;

  for r in
    select indexname
    from pg_indexes
    where tablename = 'bairros'
      and indexdef ilike '%unique%'
      and indexdef ilike '%(slug)%'
      and indexdef not ilike '%cidade%'
  loop
    execute format('drop index if exists %I', r.indexname);
  end loop;
end $$;

alter table bairros drop constraint if exists bairros_cidade_slug_key;
alter table bairros add constraint bairros_cidade_slug_key unique (cidade, slug);

-- 3) Inserir os bairros de Guarujá -------------------------------------
insert into bairros (nome, slug, cidade) values
  ('Acapulco', 'acapulco', 'Guaruja'),
  ('Astúrias', 'asturias', 'Guaruja'),
  ('Baia Branca', 'baia-branca', 'Guaruja'),
  ('Barreira do João Guarda', 'barreira-do-joao-guarda', 'Guaruja'),
  ('Barra Funda', 'barra-funda', 'Guaruja'),
  ('Bela Vista', 'bela-vista', 'Guaruja'),
  ('Cachoeira', 'cachoeira', 'Guaruja'),
  ('Caiçara', 'caicara', 'Guaruja'),
  ('Camburi', 'camburi', 'Guaruja'),
  ('Centro', 'centro', 'Guaruja'),
  ('Cidade Atlântica', 'cidade-atlantica', 'Guaruja'),
  ('Construtores', 'construtores', 'Guaruja'),
  ('Cruz das Almas', 'cruz-das-almas', 'Guaruja'),
  ('Enseada', 'enseada', 'Guaruja'),
  ('Ferry Boat', 'ferry-boat', 'Guaruja'),
  ('Guaiúba', 'guaiuba', 'Guaruja'),
  ('Jardim Alvorada', 'jardim-alvorada', 'Guaruja'),
  ('Jardim Alice', 'jardim-alice', 'Guaruja'),
  ('Jardim Boa Esperança', 'jardim-boa-esperanca', 'Guaruja'),
  ('Jardim Brasil', 'jardim-brasil', 'Guaruja'),
  ('Jardim Enseada', 'jardim-enseada', 'Guaruja'),
  ('Jardim Helena Maria', 'jardim-helena-maria', 'Guaruja'),
  ('Jardim Las Palmas', 'jardim-las-palmas', 'Guaruja'),
  ('Jardim Mar e Céu', 'jardim-mar-e-ceu', 'Guaruja'),
  ('Jardim Menina Moça', 'jardim-menina-moca', 'Guaruja'),
  ('Jardim Praiano', 'jardim-praiano', 'Guaruja'),
  ('Jardim Progresso', 'jardim-progresso', 'Guaruja'),
  ('Jardim Santa Maria', 'jardim-santa-maria', 'Guaruja'),
  ('Jardim São Miguel', 'jardim-sao-miguel', 'Guaruja'),
  ('Jardim Virgínia', 'jardim-virginia', 'Guaruja'),
  ('Mar Casado', 'mar-casado', 'Guaruja'),
  ('Morrinhos', 'morrinhos', 'Guaruja'),
  ('Paecara', 'paecara', 'Guaruja'),
  ('Outeiro', 'outeiro', 'Guaruja'),
  ('Perequê', 'pereque', 'Guaruja'),
  ('Pitangueiras', 'pitangueiras', 'Guaruja'),
  ('Pouca Farinha', 'pouca-farinha', 'Guaruja'),
  ('Santa Cruz dos Navegantes', 'santa-cruz-dos-navegantes', 'Guaruja'),
  ('Santa Rosa', 'santa-rosa', 'Guaruja'),
  ('Santo Antônio', 'santo-antonio', 'Guaruja'),
  ('São Manuel', 'sao-manuel', 'Guaruja'),
  ('Sítio Paecara', 'sitio-paecara', 'Guaruja'),
  ('Tombo', 'tombo', 'Guaruja'),
  ('Tortugas', 'tortugas', 'Guaruja'),
  ('Vicente de Carvalho', 'vicente-de-carvalho', 'Guaruja'),
  ('Vila Baiana', 'vila-baiana', 'Guaruja')
on conflict (cidade, slug) do nothing;
