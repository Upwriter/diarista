-- ============================================================================
-- Registro histórico da PRIMEIRA assinatura paga da diarista.
-- Preenchido pelo webhook do Stripe na primeira vez que o pagamento é
-- confirmado (plano vira 'pago'). NUNCA é sobrescrito: se ela cancelar e
-- reassinar, a data original permanece (o webhook só grava quando está nulo).
--
-- Rode MANUALMENTE no SQL editor do Supabase.
-- ============================================================================
ALTER TABLE diaristas
  ADD COLUMN IF NOT EXISTS primeira_assinatura_em timestamptz;

COMMENT ON COLUMN diaristas.primeira_assinatura_em IS
  'Data/hora em que a diarista virou pagante pela PRIMEIRA vez. Registro histórico, nunca sobrescrito.';
