-- ============================================================================
-- Fase B — onboarding em dois planos.
-- Marca uma diarista que fez o onboarding PROFISSIONAL mas ainda NÃO teve o
-- pagamento confirmado, ficando no plano Gratuito com dados que excedem os
-- limites do Gratuito (mais de 1 serviço/bairro, 2 WhatsApp).
--
-- Enquanto ajuste_pendente = true, a diarista fica com ativo = false (não
-- aparece em buscas/matching/perfil público). Ela resolve no /painel escolhendo
-- o que manter (ou assinando), o que zera este flag e reativa o perfil.
--
-- Rode MANUALMENTE no SQL editor do Supabase.
-- ============================================================================
ALTER TABLE diaristas
  ADD COLUMN IF NOT EXISTS ajuste_pendente boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN diaristas.ajuste_pendente IS
  'true = onboarding Profissional sem pagamento confirmado, com dados acima do limite do Gratuito. Perfil fica oculto (ativo=false) até a diarista ajustar ou assinar.';

CREATE INDEX IF NOT EXISTS idx_diaristas_ajuste_pendente
  ON diaristas (ajuste_pendente)
  WHERE ajuste_pendente = true;

-- ----------------------------------------------------------------------------
-- RLS: a diarista precisa LER O PRÓPRIO perfil mesmo quando ativo = false.
-- Hoje a única policy de SELECT em diaristas é "ativas públicas" (ativo = true);
-- como o ajuste deixa o perfil com ativo = false, sem esta policy o /painel dela
-- não carregaria (redirecionaria para /entrar) e o ajuste ficaria inacessível.
--
-- Esta policy só casa quando auth.uid() = user_id (a própria dona logada). O
-- público anônimo (auth.uid() nulo) NÃO casa, então perfis inativos continuam
-- ocultos nas buscas. As policies de SELECT são combinadas por OR.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "diarista le seu proprio perfil" ON diaristas;
CREATE POLICY "diarista le seu proprio perfil" ON diaristas
  FOR SELECT USING (auth.uid() = user_id);
