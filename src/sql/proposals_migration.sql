-- =====================================================
-- SISTEMA DE PROPOSTAS FINAIS (TRAMPO)
-- Execute no Supabase SQL Editor
-- Pré-requisito: tabelas messages, conversations, bookings
-- =====================================================

-- =====================================================
-- 1. Adicionar coluna message_type na tabela messages
-- =====================================================
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text'
CHECK (message_type IN ('text', 'proposal', 'proposal_accepted', 'proposal_rejected'));

-- =====================================================
-- 2. TABELA: proposals
-- Armazena dados estruturados de uma proposta final
-- =====================================================
CREATE TABLE public.proposals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  conversation_id bigint NOT NULL,
  message_id bigint NOT NULL,
  provider_id uuid NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  price numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'dinheiro')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  rejection_reason text,
  CONSTRAINT proposals_pkey PRIMARY KEY (id),
  CONSTRAINT proposals_conversation_id_fkey FOREIGN KEY (conversation_id)
    REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT proposals_message_id_fkey FOREIGN KEY (message_id)
    REFERENCES public.messages(id) ON DELETE CASCADE,
  CONSTRAINT proposals_provider_id_fkey FOREIGN KEY (provider_id)
    REFERENCES public.profiles(id)
);

CREATE INDEX idx_proposals_conversation_id ON public.proposals (conversation_id);
CREATE INDEX idx_proposals_message_id ON public.proposals (message_id);

COMMENT ON TABLE public.proposals
IS 'Propostas finais enviadas pelo prestador durante a negociação.';

-- =====================================================
-- 3. Adicionar campos de pagamento na tabela bookings
-- =====================================================
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS final_price numeric,
ADD COLUMN IF NOT EXISTS final_scheduled_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS client_payment_confirmed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS provider_payment_confirmed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS chat_locked boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS chat_locked_at timestamp with time zone;

-- =====================================================
-- 4. RLS: proposals
-- =====================================================
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Participantes do booking podem ver propostas
CREATE POLICY "Participantes podem ver propostas"
ON public.proposals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.bookings b ON b.id = c.booking_id
    WHERE c.id = proposals.conversation_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
);

-- Prestador pode criar proposta
CREATE POLICY "Prestador pode criar proposta"
ON public.proposals
FOR INSERT
TO authenticated
WITH CHECK (
  provider_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.bookings b ON b.id = c.booking_id
    WHERE c.id = conversation_id
    AND b.professional_id = auth.uid()
  )
);

-- Participantes podem atualizar proposta (aceitar/recusar)
CREATE POLICY "Participantes podem atualizar proposta"
ON public.proposals
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.bookings b ON b.id = c.booking_id
    WHERE c.id = proposals.conversation_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
);

-- =====================================================
-- 5. Atualizar a policy de UPDATE em messages
--    para permitir atualizar message_type
-- =====================================================
-- Não precisamos alterar pois a coluna message_type já está
-- coberta pela policy existente de INSERT.

-- =====================================================
-- 6. REALTIME: habilitar na tabela proposals
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
