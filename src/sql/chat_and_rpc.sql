-- =====================================================
-- SISTEMA DE CHAT + RPC DE DISTÂNCIA
-- Execute este script no Supabase SQL Editor
-- Pré-requisito: tabelas bookings, profiles, services
-- =====================================================

-- =====================================================
-- 1. TABELA: conversations
-- =====================================================
CREATE TABLE public.conversations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  booking_id bigint NOT NULL,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_booking_id_fkey FOREIGN KEY (booking_id)
    REFERENCES public.bookings(id) ON DELETE CASCADE,
  CONSTRAINT conversations_booking_id_unique UNIQUE (booking_id)
);

COMMENT ON TABLE public.conversations
IS 'Conversas vinculadas a agendamentos. Uma conversa por booking.';

-- =====================================================
-- 2. TABELA: messages
-- =====================================================
CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  conversation_id bigint NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id)
    REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id)
    REFERENCES public.profiles(id)
);

COMMENT ON TABLE public.messages
IS 'Mensagens de chat entre cliente e profissional.';

-- Índices para performance
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX idx_messages_conversation_created ON public.messages (conversation_id, created_at DESC);
CREATE INDEX idx_conversations_booking_id ON public.conversations (booking_id);

-- =====================================================
-- 3. RLS: conversations
-- =====================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Participantes do booking podem ver a conversa
CREATE POLICY "Participantes podem ver suas conversas"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = conversations.booking_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
);

-- Participantes do booking podem criar conversa
CREATE POLICY "Participantes podem criar conversa"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
);

-- =====================================================
-- 4. RLS: messages
-- =====================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participantes da conversa podem ver mensagens
CREATE POLICY "Participantes podem ver mensagens"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.bookings b ON b.id = c.booking_id
    WHERE c.id = messages.conversation_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
);

-- Participantes podem enviar mensagens (sender = autenticado)
CREATE POLICY "Participantes podem enviar mensagens"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.bookings b ON b.id = c.booking_id
    WHERE c.id = conversation_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
);

-- Destinatário pode marcar mensagens como lidas
CREATE POLICY "Destinatarios podem marcar mensagens como lidas"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  sender_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.bookings b ON b.id = c.booking_id
    WHERE c.id = messages.conversation_id
    AND (b.client_id = auth.uid() OR b.professional_id = auth.uid())
  )
)
WITH CHECK (
  sender_id != auth.uid()
);

-- =====================================================
-- 5. RLS: profiles (policy adicional)
-- Permite que participantes de um booking vejam
-- o perfil do outro participante
-- =====================================================
CREATE POLICY "Participantes de agendamento podem ver perfis entre si"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE (b.client_id = auth.uid() AND b.professional_id = profiles.id)
       OR (b.professional_id = auth.uid() AND b.client_id = profiles.id)
  )
);

-- =====================================================
-- 6. RPC: get_provider_bookings_with_distance
-- Retorna bookings do provider com distância até o cliente
-- =====================================================
CREATE OR REPLACE FUNCTION get_provider_bookings_with_distance(provider_uuid uuid)
RETURNS TABLE (
  booking_id bigint,
  created_at timestamptz,
  client_id uuid,
  professional_id uuid,
  service_id bigint,
  status text,
  description text,
  scheduled_date timestamptz,
  client_full_name text,
  client_avatar_url text,
  service_name text,
  distance_km float,
  conversation_id bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  provider_geo geography;
BEGIN
  -- Localização do provider
  SELECT p.location::geography INTO provider_geo
  FROM public.profiles p
  WHERE p.id = provider_uuid;

  RETURN QUERY
  SELECT
    b.id AS booking_id,
    b.created_at,
    b.client_id,
    b.professional_id,
    b.service_id,
    b.status,
    b.description,
    b.scheduled_date,
    cp.full_name AS client_full_name,
    cp.avatar_url AS client_avatar_url,
    s.name AS service_name,
    CASE
      WHEN provider_geo IS NOT NULL AND cp.location IS NOT NULL
      THEN (ST_Distance(cp.location::geography, provider_geo) / 1000)::float
      ELSE NULL
    END AS distance_km,
    c.id AS conversation_id
  FROM public.bookings b
  LEFT JOIN public.profiles cp ON cp.id = b.client_id
  LEFT JOIN public.services s ON s.id = b.service_id
  LEFT JOIN public.conversations c ON c.booking_id = b.id
  WHERE b.professional_id = provider_uuid
  ORDER BY b.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_provider_bookings_with_distance(uuid)
IS 'Retorna todos os bookings de um profissional com a distância calculada até cada cliente.';

-- =====================================================
-- 8. RPC: get_client_bookings_with_details
-- Retorna bookings do cliente com dados do profissional,
-- preço do serviço e distância
-- =====================================================
CREATE OR REPLACE FUNCTION get_client_bookings_with_details(client_uuid uuid)
RETURNS TABLE (
  booking_id bigint,
  created_at timestamptz,
  client_id uuid,
  professional_id uuid,
  service_id bigint,
  status text,
  description text,
  scheduled_date timestamptz,
  professional_full_name text,
  professional_avatar_url text,
  service_name text,
  service_price numeric,
  service_unit text,
  distance_km float,
  conversation_id bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_geo geography;
BEGIN
  -- Localização do cliente
  SELECT p.location::geography INTO client_geo
  FROM public.profiles p
  WHERE p.id = client_uuid;

  RETURN QUERY
  SELECT
    b.id AS booking_id,
    b.created_at,
    b.client_id,
    b.professional_id,
    b.service_id,
    b.status,
    b.description,
    b.scheduled_date,
    pp.full_name AS professional_full_name,
    pp.avatar_url AS professional_avatar_url,
    s.name AS service_name,
    ps.price AS service_price,
    ps.unit::text AS service_unit,
    CASE
      WHEN client_geo IS NOT NULL AND pp.location IS NOT NULL
      THEN (ST_Distance(pp.location::geography, client_geo) / 1000)::float
      ELSE NULL
    END AS distance_km,
    c.id AS conversation_id
  FROM public.bookings b
  LEFT JOIN public.profiles pp ON pp.id = b.professional_id
  LEFT JOIN public.services s ON s.id = b.service_id
  LEFT JOIN public.professional_services ps
    ON ps.professional_id = b.professional_id AND ps.service_id = b.service_id
  LEFT JOIN public.conversations c ON c.booking_id = b.id
  WHERE b.client_id = client_uuid
  ORDER BY b.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_client_bookings_with_details(uuid)
IS 'Retorna todos os bookings de um cliente com dados do profissional, preço e distância.';

-- =====================================================
-- 7. REALTIME: habilitar na tabela messages
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
