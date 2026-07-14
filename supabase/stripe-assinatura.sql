-- =====================================================================
-- Campos de assinatura (Stripe) na tabela diaristas
-- Supabase > SQL Editor > cole tudo > Run. Pode rodar mais de uma vez.
-- Observação: o plano em si continua no campo já existente `plano`
-- ('free' = Gratuito, 'pago' = Profissional). Aqui só adicionamos os
-- metadados da assinatura.
-- =====================================================================

alter table diaristas add column if not exists stripe_customer_id       text;
alter table diaristas add column if not exists stripe_subscription_id   text;
alter table diaristas add column if not exists assinatura_status        text not null default 'sem_assinatura';
  -- valores: 'sem_assinatura' | 'ativa' | 'cancelada' | 'inadimplente'
alter table diaristas add column if not exists data_inicio_assinatura   timestamptz;
alter table diaristas add column if not exists data_fim_periodo         timestamptz;
alter table diaristas add column if not exists cancelamento_agendado    boolean not null default false;

-- Índice para o webhook localizar a diarista pelo customer do Stripe.
create index if not exists idx_diaristas_stripe_customer on diaristas (stripe_customer_id);
