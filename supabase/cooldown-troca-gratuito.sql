-- ============================================================================
-- Cooldown de troca no plano GRATUITO (1 serviço / 1 bairro de verdade).
-- Registra quando foi a última troca de serviço e de bairro, para limitar a
-- troca a no máximo 1 vez a cada 60 dias (relógios independentes).
--
-- A PRIMEIRA troca é livre (campo nulo) e inicia o relógio daquele campo.
-- Só afeta o plano Gratuito (rota /api/diarista/atuacao). O Profissional tem
-- regras próprias e não é afetado.
--
-- Rode MANUALMENTE no SQL editor do Supabase.
-- ============================================================================
ALTER TABLE diaristas
  ADD COLUMN IF NOT EXISTS ultima_troca_servico_em timestamptz;

ALTER TABLE diaristas
  ADD COLUMN IF NOT EXISTS ultima_troca_bairro_em timestamptz;

COMMENT ON COLUMN diaristas.ultima_troca_servico_em IS
  'Data/hora da última troca de serviço no plano Gratuito. Limita a 1 troca a cada 60 dias.';
COMMENT ON COLUMN diaristas.ultima_troca_bairro_em IS
  'Data/hora da última troca de bairro no plano Gratuito. Limita a 1 troca a cada 60 dias.';
