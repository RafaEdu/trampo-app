# Este arquivo concentra as definições de:

- ENUMs (tipos personalizados)
- Funções de negócio e auxiliares
- Triggers
- Views
- Índices
- Comentários
- Pequenos ajustes de schema ligados a esses objetos

> Pré-requisito: tabelas já criadas (ver script de `CREATE TABLE`).

## 1. Tipos ENUM

### 1.1. Account Type e User Role

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type_enum') THEN
    CREATE TYPE public.account_type_enum AS ENUM ('pf', 'pj');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE public.user_role_enum AS ENUM ('provider', 'client');
  END IF;
END $$;
```

### 1.2. Service Unit

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_unit_enum') THEN
    CREATE TYPE public.service_unit_enum AS ENUM ('hora', 'servico', 'dia', 'm2', 'unidade');
  END IF;
END $$;
```

### 1.3. Document Types e Verification Status

```sql
DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_type_enum') THEN
CREATE TYPE public.doc_type_enum AS ENUM ('cnh', 'rg', 'titulo_eleitor');
END IF;

IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status_enum') THEN
CREATE TYPE public.verification_status_enum AS ENUM ('pending', 'verified', 'rejected', 'suspended');
END IF;
END $$;
```

## 2. Índices

### 2.1. Índice GIST para localização de profiles

```sql
CREATE INDEX IF NOT EXISTS profiles_location_idx
ON public.profiles
USING GIST (location);
```

### 2.2. Índice por email de profile

```sql
CREATE INDEX IF NOT EXISTS profiles_email_idx
ON public.profiles (email);
```

### 2.3. Índices para provider_documents

```sql
CREATE INDEX IF NOT EXISTS idx_provider_documents_status
ON public.provider_documents(status);

CREATE INDEX IF NOT EXISTS idx_provider_documents_profile
ON public.provider_documents(profile_id);
```

## 3. Funções Auxiliares

### 3.1. Função para buscar role do usuário atual

```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role_enum AS $$
BEGIN
RETURN (
SELECT user_role
FROM public.profiles
WHERE id = auth.uid()
);
END;

$$
LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_my_role() IS 'Retorna o user_role (provider ou client) do usuário autenticado.';


$$
```

### 3.2. Função de proteção da coluna is_admin

```sql
CREATE OR REPLACE FUNCTION public.protect_is_admin_column()
RETURNS TRIGGER AS $$
BEGIN
-- Se o valor de is_admin está sendo alterado...
IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
-- ...e quem está fazendo a alteração é um usuário comum (auth/anon)
IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
RAISE EXCEPTION 'Acesso negado: Você não pode alterar seu próprio status de administrador.';
END IF;
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;
$$
```

## 4. Função de criação automática de Profile (handle_new_user)

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
-- Tratamento de tipos
v_data_nascimento date;
v_account_type public.account_type_enum;
v_user_role public.user_role_enum;

-- Geração de username
v_username text;
v_base_name text;
v_suffix text;
v_username_exists boolean;
BEGIN
```

#### 1. TRATAMENTO DE DADOS (CASTING SEGURO)

```sql
-- Data de nascimento
BEGIN
v_data_nascimento := (NEW.raw_user_meta_data ->> 'data_nascimento')::date;
EXCEPTION WHEN OTHERS THEN
v_data_nascimento := NULL;
END;

-- Account Type (Enum)
BEGIN
v_account_type := (NEW.raw_user_meta_data ->> 'account_type')::public.account_type_enum;
EXCEPTION WHEN OTHERS THEN
v_account_type := NULL;
END;

-- User Role (Enum)
BEGIN
v_user_role := (NEW.raw_user_meta_data ->> 'user_role')::public.user_role_enum;
EXCEPTION WHEN OTHERS THEN
v_user_role := NULL;
END;
```

#### 2. GERAÇÃO DE USERNAME ÚNICO

```sql
v_base_name := COALESCE(
lower(split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1)),
'user'
);

-- Remove caracteres especiais (mantém letras e números)
v_base_name := regexp_replace(v_base_name, '[^a-z0-9]', '', 'g');

LOOP
v_suffix := (floor(random() \* 9000) + 1000)::text;
v_username := v_base_name || v_suffix;

    SELECT EXISTS(
      SELECT 1
      FROM public.profiles
      WHERE username = v_username
    )
    INTO v_username_exists;

    EXIT WHEN NOT v_username_exists;

END LOOP;
```

#### 3. INSERÇÃO NO PERFIL

```sql
INSERT INTO public.profiles (
id,
full_name,
avatar_url,
account_type,
user_role,
data_nascimento,
cpf_cnpj,
document_type,
email,
username
)
VALUES (
NEW.id,
NEW.raw_user_meta_data ->> 'full_name',
NEW.raw_user_meta_data ->> 'avatar_url',
v_account_type,
v_user_role,
v_data_nascimento,
NEW.raw_user_meta_data ->> 'cpf_cnpj',
NEW.raw_user_meta_data ->> 'document_type',
NEW.email,
v_username
);

RETURN NEW;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

$$
```

## 5. Função de busca de profissionais (geolocalizada)

```sql
CREATE OR REPLACE FUNCTION search_professionals(
client_lat float,
client_lng float,
search_radius_meters int,
search_term text
)
RETURNS TABLE (
id uuid,
full_name text,
distance float,
matched_service text,
other_services text[],
price numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
client_location geography;
fuzzy_search_term text;
BEGIN
-- Ponto do cliente
client_location := ST_MakePoint(client_lng, client_lat)::geography;

-- Termo de busca case-insensitive
fuzzy_search_term := '%' || search_term || '%';

RETURN QUERY
WITH
matched_services AS (
SELECT
p.id AS professional_id,
p.full_name AS professional_name,
p.location AS professional_location,
s.name AS service_name,
ps.price AS service_price,
CASE
WHEN s.name ILIKE fuzzy_search_term THEN 1
WHEN p.full_name ILIKE fuzzy_search_term THEN 2
END AS match_priority
FROM public.profiles p
JOIN public.professional_services ps
ON p.id = ps.professional_id
JOIN public.services s
ON ps.service_id = s.id
WHERE
p.user_role = 'provider'
AND ST_DWithin(p.location, client_location, search_radius_meters)
AND (s.name ILIKE fuzzy_search_term OR p.full_name ILIKE fuzzy_search_term)
),
ranked_matches AS (
SELECT
\*,
ROW_NUMBER() OVER(
PARTITION BY professional_id
ORDER BY match_priority, service_name
) AS rn
FROM matched_services
),
all_services AS (
SELECT
ps.professional_id,
array_agg(s.name) AS service_list
FROM public.professional_services ps
JOIN public.services s
ON ps.service_id = s.id
GROUP BY ps.professional_id
)
SELECT
p.id,
p.full_name,
(ST_Distance(p.location, client_location) / 1000)::float AS distance,
rm.service_name AS matched_service,
als.service_list AS other_services,
rm.service_price AS price
FROM ranked_matches rm
JOIN public.profiles p
ON rm.professional_id = p.id
LEFT JOIN all_services als
ON p.id = als.professional_id
WHERE rm.rn = 1
ORDER BY distance;
END;

$$
;
$$
```

## 6. Triggers

### 6.1. Trigger de criação automática de profile

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### 6.2. Trigger de proteção da coluna is_admin

```sql
DROP TRIGGER IF EXISTS trigger_protect_is_admin ON public.profiles;

CREATE TRIGGER trigger_protect_is_admin
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_is_admin_column();
```

## 7. Views

### 7.1. View profiles_with_age

```sql
CREATE OR REPLACE VIEW public.profiles_with_age AS
SELECT
\*,
date_part('year', age(data_nascimento)) AS idade
FROM public.profiles;
```

## 8. omentários

### 8.1. Tabelas e colunas

```sql
COMMENT ON TABLE public.service_categories
IS 'Categorias principais de serviços (Ex: Eletricista, Encanador).';

COMMENT ON COLUMN public.service_categories.name
IS 'Nome único da categoria.';

COMMENT ON TABLE public.services
IS 'Serviços específicos dentro de cada categoria (Ex: Troca de chuveiro).';

COMMENT ON COLUMN public.services.category_id
IS 'Referência para a categoria pai (service_categories.id).';

COMMENT ON TABLE public.professional_services
IS 'Tabela de junção que liga profissionais aos serviços que eles prestam.';

COMMENT ON COLUMN public.professional_services.price
IS 'Preço cobrado pelo profissional para este serviço específico.';

COMMENT ON COLUMN public.professional_services.unit
IS 'Unidade de cobrança (hora, serviço, dia, m2, etc).';
```

## 9. Ajustes específicos em provider_documents

```sql
ALTER TABLE public.provider_documents
DROP CONSTRAINT IF EXISTS provider_documents_profile_id_fkey;

-- Garante que a API (PostgREST) recarregue as configs rapidamente
NOTIFY pgrst, 'reload config';
```
