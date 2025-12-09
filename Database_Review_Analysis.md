---

## 4. Arquivo: Database_Review_Analysis.md

```md
# Análise e Avaliação da Modelagem Atual (Supabase)

Este documento traz um parecer técnico sobre o estado atual do banco,
considerando o uso com um app mobile (React Native) e backend em Node.js,
com Supabase como backend-as-a-service.

---

## 1. Visão Geral

O modelo atual é consistente com um marketplace de serviços:

- **Usuários / perfis**
  - `auth.users` + `public.profiles`
  - Enriquecimento de dados via `handle_new_user()`:
    - `account_type` (pf/pj)
    - `user_role` (provider/client)
    - `data_nascimento`, `cpf_cnpj`, `document_type`, `email`
    - `username` gerado automaticamente
- **Catálogo de serviços**
  - `service_categories` (categorias principais)
  - `services` (serviços específicos da categoria)
  - `professional_services` (ligação provider ↔ serviço + preço/unidade)
- **Operação**
  - `bookings` (agendamentos entre cliente e profissional)
- **KYC / verificação**
  - `provider_documents` com status e tipos de documento
  - Campo `verification_status` em `profiles`
- **Segurança**
  - RLS consistente por tabela
  - Coluna sensível `is_admin` protegida por trigger
  - Policies de storage para bucket `avatars`

No geral, a arquitetura está **bem direcionada para produção**, com boas práticas de:

- RLS aplicada na maioria das tabelas.
- Uso de ENUMs para campos de domínio fixo.
- Organização de lógica de negócio no banco (functions e triggers) em vez de espalhar no client.

---

## 2. Pontos Fortes Identificados

1. **Separação clara de papéis (provider vs client)**
   - `user_role_enum` e a função `get_my_role()` permitem validar backend-side
     se o usuário é de fato um provider antes de deixá-lo manipular `professional_services`.

2. **RLS bem pensada para fluxo real de negócio**
   - Perfis: usuário só vê/atualiza o próprio registro (bom para LGPD).
   - `bookings`: política clara de quem pode criar/ver/editar.
   - `provider_documents`: provider só mexe nos próprios; admin pode revisar todos.

3. **Função de criação de profile robusta (`handle_new_user`)**
   - Tratar parsing da data.
   - Tratar enums de forma segura.
   - Gerar usernames únicos.
   - Preencher avatar, documentos e email.

4. **Geolocalização e busca de profissionais**
   - `search_professionals` usa PostGIS (`ST_DWithin`, `ST_Distance`).
   - Retorno já no formato consumível pelo app (id, full_name, distance, matched_service, other_services, price).

5. **Proteção de campo administrativo**
   - Trigger `protect_is_admin_column` impede que um usuário comum se promova a admin,
     mesmo que o client mande `is_admin = true`.

---

## 3. Riscos / Inconsistências Encontradas

1. **Histórico de scripts bagunçado (múltiplas versões de handle_new_user, policies duplicadas)**
   - Várias recriações de `handle_new_user` e de policies em `profiles` fazem com que,
     se scripts forem rodados fora de ordem ou parcialmente, a lógica final possa ficar inconsistente.
   - O arquivo de RLS consolidado resolve esse problema ao limpar (`DROP POLICY IF EXISTS`) e recriar
     apenas a versão final que você deseja.

2. **Diferença entre CREATE TABLE inicial e estado atual de `provider_documents`**
   - O bloco inicial de `CREATE TABLE provider_documents` difere da versão final (onde você fez `DROP TABLE` + recriação com `doc_type_enum`).
   - Em produção:
     - É importante considerar qual versão está realmente em uso.
     - O script consolidado assume a **versão mais recente** (com `doc_type_enum` e `verification_status_enum`),
       o que parece ser a intenção atual do projeto.

3. **Colunas com tipo `USER-DEFINED` no dump**
   - No export, campos como `account_type`, `user_role`, `location`, `document_type` aparecem como `USER-DEFINED`.
   - Na prática:
     - `account_type` e `user_role` são `*_enum`, e isso é coerente com as funções.
     - `location` é usada como `geography`/`geometry` (PostGIS) em `search_professionals`.
   - Recomendações:
     - Confirmar, no banco real, os tipos exatos usados para `location` (idealmente `geography(Point, 4326)`).
     - Garantir que o migration oficial de CREATE TABLE reflita isso com precisão, para futuros ambientes.

4. **Ausência de policy de INSERT em profiles (intencional, mas sensível)**
   - Atualmente, `profiles` não tem policy de INSERT para o app client, o que é OK porque:
     - O insert é feito pelo trigger `handle_new_user` (executado com role privilegiada).
   - Cuidado:
     - Não usar o client JS para tentar inserir diretamente em `public.profiles` com a role `authenticated`,
       pois isso falharia sem policy.
     - Toda criação de usuário deve ser via fluxo de autenticação do Supabase.

5. **Dependência forte do app em relação a enums (front/back)**
   - Front precisa conhecer os valores exatos dos ENUMs:
     - `account_type_enum`: 'pf', 'pj'
     - `user_role_enum`: 'provider', 'client'
     - `doc_type_enum`: 'cnh', 'rg', 'titulo_eleitor'
     - `verification_status_enum`: 'pending', 'verified', 'rejected', 'suspended'
   - Ideal:
     - Centralizar esses valores em um módulo compartilhado no app (por exemplo, um arquivo `enums.ts`)
     - E sempre validar antes de enviar para o Supabase.

---

## 4. Recomendações de Melhoria / Roadmap

### 4.1. Organização de Migrations

- Criar uma estrutura de migrations bem definida (por exemplo, usando os próprios migrations do Supabase ou um sistema versionado).
- Orquestração sugerida:
  1. `01_tables.sql` – apenas `CREATE TABLE`.
  2. `02_types_indexes.sql` – criação de ENUMs + índices.
  3. `03_functions_triggers_views.sql` – conteúdo do `Triggers_Functions_Views.md`.
  4. `04_rls_policies.sql` – conteúdo do `Row_Level_Security.md`.

### 4.2. Ambiente de Homologação

- Subir um ambiente de staging/homologação:
  - Aplicar todos os scripts limpos do zero.
  - Rodar o app apontando para esse ambiente.
  - Validar fluxos:
    - Cadastro (criando profiles).
    - Cadastro de provider vs client.
    - Cadastro de serviços e preços.
    - Agendamentos (bookings).
    - Envio de documentos do provider + aprovação pelo admin.
    - Busca geolocalizada de profissionais.

### 4.3. Monitoramento de RLS em Produção

- Em caso de erro “permission denied” no client:
  - Sempre verificar se:
    - O usuário está autenticado (`supabase.auth.getUser()`).
    - A policy correspondente cobre:
      - O verbo (SELECT / INSERT / UPDATE / DELETE).
      - A role (`authenticated` / `anon`).
      - O filtro (ex.: `auth.uid() = client_id` vs campo correto na tabela).

### 4.4. Integração com React Native / Node.js

- Para a função `search_professionals`, use no client:

  ```ts
  const { data, error } = await supabase
    .rpc('search_professionals', {
      client_lat: ...,
      client_lng: ...,
      search_radius_meters: ...,
      search_term: 'chuveiro',
    });
  ```
