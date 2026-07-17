-- ============================================================================
-- Seed dos 5 serviços oferecidos no cadastro.
-- Os SLUGS precisam bater EXATAMENTE com o formulário (components/CadastroForm.tsx)
-- e com o catálogo de adicionais (lib/adicionais.ts), senão o cadastro descarta
-- silenciosamente os serviços cujo slug não existir aqui.
-- Idempotente: pode rodar de novo sem duplicar.
-- ============================================================================
insert into servicos (nome, slug) values
  ('Diarista',         'diarista'),
  ('Faxineira',        'faxineira'),
  ('Passadeira',       'passadeira'),
  ('Limpeza pós-obra', 'limpeza-pos-obra'),
  ('Cozinheira',       'cozinheira')
on conflict (slug) do nothing;
