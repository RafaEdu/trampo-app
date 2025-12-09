# Row Level Security (RLS) – Supabase

Este arquivo concentra TODAS as regras de RLS e policies utilizadas no projeto.

> Pré-requisito: as tabelas já devem existir (ver script de `CREATE TABLE`).

---

## 1. Profiles

### 1.1. Habilitar RLS

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 1.2. Limpar policies antigas conflitantes (se existirem)

```sql
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON public.profiles;
```

### 1.3. Policies atuais

```sql
CREATE POLICY "Usuários podem ver o próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## 2. Service Categories

### 2.1. Habilitar RLS

```sql
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
```

### 2.2. Limpar policies antigas (caso precise)

```sql
DROP POLICY IF EXISTS "Public categories are viewable by everyone." ON public.service_categories;
DROP POLICY IF EXISTS "Admins podem criar categorias" ON public.service_categories;
DROP POLICY IF EXISTS "Admins podem atualizar categorias" ON public.service_categories;
DROP POLICY IF EXISTS "Admins podem deletar categorias" ON public.service_categories;
```

### 2.3. Policies atuais

```sql
-- SELECT público
CREATE POLICY "Public categories are viewable by everyone."
ON public.service_categories
FOR SELECT
USING (true);

-- INSERT por admins
CREATE POLICY "Admins podem criar categorias"
ON public.service_categories
FOR INSERT
TO authenticated
WITH CHECK (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);

-- UPDATE por admins
CREATE POLICY "Admins podem atualizar categorias"
ON public.service_categories
FOR UPDATE
TO authenticated
USING (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);

-- DELETE por admins
CREATE POLICY "Admins podem deletar categorias"
ON public.service_categories
FOR DELETE
TO authenticated
USING (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);
```

## 3. Services

### 3.1. Habilitar RLS

```sql
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
```

### 3.2. Limpar policies antigas

```sql
DROP POLICY IF EXISTS "Public services are viewable by everyone." ON public.services;
DROP POLICY IF EXISTS "Admins podem criar serviços" ON public.services;
DROP POLICY IF EXISTS "Admins podem atualizar serviços" ON public.services;
DROP POLICY IF EXISTS "Admins podem deletar serviços" ON public.services;
```

### 3.3. Policies atuais

```sql
-- SELECT público
CREATE POLICY "Public services are viewable by everyone."
ON public.services
FOR SELECT
USING (true);

-- INSERT por admins
CREATE POLICY "Admins podem criar serviços"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);

-- UPDATE por admins
CREATE POLICY "Admins podem atualizar serviços"
ON public.services
FOR UPDATE
TO authenticated
USING (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);

-- DELETE por admins
CREATE POLICY "Admins podem deletar serviços"
ON public.services
FOR DELETE
TO authenticated
USING (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);
```

## 4. Professional Services

### 4.1. Habilitar RLS

```sql
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
```

### 4.2. Limpar policies antigas

```sql
DROP POLICY IF EXISTS "Public professional services are viewable by everyone." ON public.professional_services;
DROP POLICY IF EXISTS "Providers can insert their own services." ON public.professional_services;
DROP POLICY IF EXISTS "Providers can update their own services." ON public.professional_services;
DROP POLICY IF EXISTS "Providers can delete their own services." ON public.professional_services;
```

### 4.3. Policies atuais

```sql
-- SELECT público
CREATE POLICY "Public professional services are viewable by everyone."
ON public.professional_services
FOR SELECT
USING (true);

-- INSERT por providers (donos)
CREATE POLICY "Providers can insert their own services."
ON public.professional_services
FOR INSERT
TO authenticated
WITH CHECK (
auth.uid() = professional_id
AND public.get_my_role() = 'provider'
);

-- UPDATE por providers (donos)
CREATE POLICY "Providers can update their own services."
ON public.professional_services
FOR UPDATE
TO authenticated
USING (
auth.uid() = professional_id
AND public.get_my_role() = 'provider'
);

-- DELETE por providers (donos)
CREATE POLICY "Providers can delete their own services."
ON public.professional_services
FOR DELETE
TO authenticated
USING (
auth.uid() = professional_id
AND public.get_my_role() = 'provider'
);
```

## 5. Bookings

### 5.1. Habilitar RLS

```sql
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
```

### 5.2. Limpar policies antigas (caso existam)

```sql
DROP POLICY IF EXISTS "Clientes podem criar agendamentos" ON public.bookings;
DROP POLICY IF EXISTS "Usuários veem seus próprios agendamentos" ON public.bookings;
DROP POLICY IF EXISTS "Prestadores podem atualizar seus agendamentos" ON public.bookings;
```

### 5.3. Policies atuais

```sql
-- Cliente cria agendamento para si
CREATE POLICY "Clientes podem criar agendamentos"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- Ambos (cliente ou professional) veem seus agendamentos
CREATE POLICY "Usuários veem seus próprios agendamentos"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Prestador atualiza seus agendamentos
CREATE POLICY "Prestadores podem atualizar seus agendamentos"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = professional_id);
```

## 6.0 Provider Documents

### 6.1. Habilitar RLS

```sql
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
```

### 6.2. Limpar policies antigas

```sql
DROP POLICY IF EXISTS "Users can view own documents" ON public.provider_documents;
DROP POLICY IF EXISTS "Users can upload own documents" ON public.provider_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.provider_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.provider_documents;
```

### 6.3. Policies atuais

```sql
-- Provider vê os próprios documentos
CREATE POLICY "Users can view own documents"
ON public.provider_documents
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- Provider insere (faz upload) dos próprios documentos
CREATE POLICY "Users can upload own documents"
ON public.provider_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- Admins veem todos os documentos
CREATE POLICY "Admins can view all documents"
ON public.provider_documents
FOR SELECT
TO authenticated
USING (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);

-- Admins atualizam status (aprovar/rejeitar, etc.)
CREATE POLICY "Admins can update documents"
ON public.provider_documents
FOR UPDATE
TO authenticated
USING (
EXISTS (
SELECT 1
FROM public.profiles
WHERE profiles.id = auth.uid()
AND profiles.is_admin = true
)
);
```

## 7. Storage – Bucket avatars

### 7.1. Limpar policies antigas

```sql
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatar" ON storage.objects;
```

### 7.2. Policies atuais

```sql
-- INSERT
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
bucket_id = 'avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
bucket_id = 'avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
bucket_id = 'avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
bucket_id = 'avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
);
```
