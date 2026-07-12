-- =====================================================================
-- Exclusão lógica (soft delete) do perfil da diarista
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- O registro NUNCA é apagado fisicamente: apenas marcado como excluído,
-- para preservar contrato assinado e histórico de leads/cliques ao admin.
-- =====================================================================

alter table diaristas add column if not exists excluida boolean not null default false;
alter table diaristas add column if not exists excluida_em timestamptz;

-- Índice para filtrar rapidamente as ativas (não excluídas) nas buscas/matching.
create index if not exists idx_diaristas_excluida on diaristas (excluida);
