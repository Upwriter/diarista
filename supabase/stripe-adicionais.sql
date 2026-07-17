-- ============================================================================
-- Upsell: serviços ADICIONAIS (R$ 4,90/mês cada) no Plano Profissional
-- ----------------------------------------------------------------------------
-- Regras de negócio:
--   • O Plano Profissional inclui até 3 tipos de serviço.
--   • Cada serviço além dos 3 é um ADICIONAL: R$ 4,90/mês recorrente.
--   • Máximo de 2 adicionais (5 serviços no total).
--   • Ao ADICIONAR no meio do ciclo: cobrança proporcional imediata.
--   • Ao REMOVER: o serviço continua ativo até o FIM do período já pago,
--     SEM reembolso; só depois sai da cobrança.
--
-- MODELO:
--   • A "quantity" do item de adicional no Stripe = nº de linhas em
--     diarista_servicos com adicional = true E remocao_agendada_em IS NULL.
--   • Um adicional marcado para remoção mantém a linha (com data futura) até
--     o fim do período, garantindo acesso; o webhook limpa as linhas vencidas
--     na renovação. Re-adicionar no mesmo ciclo apenas zera remocao_agendada_em.
--
-- Rode este arquivo MANUALMENTE no SQL editor do Supabase.
-- ============================================================================

-- 1) Controle da assinatura na tabela de diaristas -----------------------------
ALTER TABLE diaristas
  ADD COLUMN IF NOT EXISTS stripe_item_adicional_id text;

COMMENT ON COLUMN diaristas.stripe_item_adicional_id IS
  'ID do subscription_item do "Serviço adicional" no Stripe (criado ao contratar o 1º).';

-- Pico de adicionais JÁ COBRADOS neste ciclo. Usado para distinguir um adicional
-- NOVO (cobra proporcional) de um RE-ADICIONAR dentro do mesmo ciclo (não cobra,
-- pois ela já pagou por aquele slot). Zera/reajusta na renovação.
ALTER TABLE diaristas
  ADD COLUMN IF NOT EXISTS adicionais_pagos int NOT NULL DEFAULT 0;

COMMENT ON COLUMN diaristas.adicionais_pagos IS
  'Pico de serviços adicionais já cobrados no ciclo atual (evita cobrança dupla no re-adicionar).';

-- 2) Metadados por serviço na tabela de junção --------------------------------
ALTER TABLE diarista_servicos
  ADD COLUMN IF NOT EXISTS adicional boolean NOT NULL DEFAULT false;

ALTER TABLE diarista_servicos
  ADD COLUMN IF NOT EXISTS remocao_agendada_em timestamptz;

COMMENT ON COLUMN diarista_servicos.adicional IS
  'true = serviço pago (além dos 3 inclusos no Plano Profissional).';
COMMENT ON COLUMN diarista_servicos.remocao_agendada_em IS
  'Se preenchido, o adicional sai da cobrança e do perfil nesta data (fim do período pago). NULL = ativo.';

-- Índice para o webhook varrer adicionais vencidos rapidamente.
CREATE INDEX IF NOT EXISTS idx_diarista_servicos_remocao
  ON diarista_servicos (remocao_agendada_em)
  WHERE remocao_agendada_em IS NOT NULL;
