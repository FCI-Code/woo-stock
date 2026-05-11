# WooStock — API de Logística para WooCommerce

**Data:** 2026-04-12
**Status:** Aprovado
**Escopo:** MVP

---

## 1. Visão Geral

WooStock é uma **empresa especializada em logística e entrega** que oferece sua infraestrutura como serviço para lojas WooCommerce. Cada lojista conecta sua loja via chave de API; o WooStock recebe os pedidos, gerencia o despacho (cotação de frete, geração de etiqueta) e executa o transporte — devolvendo o status de rastreamento ao WooCommerce em tempo real.

**Filosofia:** o WooCommerce é dono de tudo relacionado à loja (produtos, estoque, pagamentos, cadastro de clientes). O WooStock é o motor de logística e transporte — da cotação à entrega na porta do cliente.

> **MVP:** A entrega física é simulada (mockada). A infraestrutura de transporte real será implementada em fase posterior.

### O que o WooStock faz

- Recebe notificação de pedido do WooCommerce (via webhook)
- Cota frete com transportadoras (via Melhor Envio)
- Gera etiqueta de envio
- Executa o transporte e atualiza o status de rastreamento
- Devolve código de rastreamento para o WooCommerce
- Exibe página pública de tracking para o cliente final
- Cobra taxa de entrega da loja ao concluir o transporte

### O que o WooStock NÃO faz

- Cadastro de usuários / login / dashboard do lojista
- Gestão de produtos ou estoque
- Processamento de pagamentos do consumidor final

### Modelo de negócio

- Empresa de logística B2B: o lojista nos contrata para realizar o transporte
- API SaaS multi-tenant — cada lojista = uma chave de API = uma loja WooCommerce
- Autenticação via API key (sem cadastro, sem login)
- **Receita:** taxa por entrega concluída, cobrada da loja (gateway de pagamento fora do escopo do MVP)

### Stack

- **Backend:** NestJS + TypeScript
- **Frontend:** Next.js (`apps/web`) — página pública de tracking
- **Banco:** MongoDB com Prisma (multi-tenant via `tenant_id` por tabela)
- **Fila:** Bull + Redis (processamento assíncrono de despachos)
- **Integrações:** WooCommerce REST API v3 + Melhor Envio API

---

## 2. Arquitetura

Arquitetura enxuta em 3 camadas:

### 2.1 Frontend (Next.js — `apps/web`)

- Página pública de tracking: `/tracking/[trackingCode]`
- Sem login — o cliente acessa pelo código de rastreio recebido por e-mail/Woo
- Consome o endpoint `GET /shipping/tracking/:trackingCode` da API
- Exibe timeline completa: preparação → despacho → em trânsito → entregue

### 2.2 API Layer (NestJS — `apps/api`)

- REST API pública (endpoints de logística)
- Webhook receiver para eventos do WooCommerce
- Guard de autenticação via API key no header (`X-API-Key`)

### 2.3 Core Modules

| Módulo     | Responsabilidade                                                                      |
| ---------- | ------------------------------------------------------------------------------------- |
| `api-keys` | Geração e validação de API keys, associação com tenant                                |
| `orders`   | Recebe pedidos do Woo via webhook, armazena dados de envio                            |
| `shipping` | Cotação de frete, geração de etiqueta, consulta de rastreio, timeline de tracking     |
| `tracking` | Cron que atualiza status de rastreio e notifica o Woo                                 |

### 2.4 Integration Layer

| Componente            | Responsabilidade                                                              |
| --------------------- | ----------------------------------------------------------------------------- |
| `woocommerce-client`  | Wrapper da API REST do WooCommerce (atualizar pedido com tracking)            |
| `melhor-envio-client` | Wrapper da API do Melhor Envio (cotação, etiqueta, rastreio)                  |
| `job-processor`       | Fila Bull/Redis para tarefas assíncronas (atualizar Woo, polling de rastreio) |

---

## 3. Modelo de Dados

### 3.1 Entidades

**`tenants`** — cada loja conectada

- `id` (UUID, PK)
- `name` (VARCHAR — nome descritivo da loja, opcional)
- `store_url` (VARCHAR — URL da loja WooCommerce)
- `api_key` (VARCHAR, unique — chave de API gerada pelo sistema)
- `api_key_hash` (VARCHAR — hash da API key para validação)
- `woo_consumer_key_encrypted` (VARCHAR — chave do Woo, criptografada)
- `woo_consumer_secret_encrypted` (VARCHAR — secret do Woo, criptografado)
- `webhook_secret` (VARCHAR — secret para validar webhooks do Woo)
- `origin_zip` (VARCHAR — CEP de origem para cotação de frete)
- `origin_address` (JSONB — endereço completo do remetente para etiqueta)
- `melhor_envio_token_encrypted` (VARCHAR — token do Melhor Envio do lojista)
- `status` (ENUM: active, inactive)
- `created_at` (TIMESTAMP)

**`orders`** — pedidos recebidos do WooCommerce

- `id` (UUID, PK)
- `tenant_id` (UUID, FK → tenants)
- `woo_order_id` (BIGINT — ID do pedido no Woo)
- `status` (ENUM: received, quoting, ready_to_ship, shipped, in_transit, delivered, error)
- `customer_name` (VARCHAR)
- `customer_email` (VARCHAR)
- `shipping_address` (JSONB — {street, number, complement, neighborhood, city, state, zip})
- `items` (JSONB — array de {name, sku, qty, weight, dimensions})
- `total_weight` (DECIMAL — peso total calculado)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint: `(tenant_id, woo_order_id)`

**`shipments`** — dados de envio gerados

- `id` (UUID, PK)
- `tenant_id` (UUID, FK → tenants)
- `order_id` (UUID, FK → orders, unique)
- `melhor_envio_shipment_id` (VARCHAR)
- `carrier` (VARCHAR — ex: correios, jadlog, loggi)
- `service` (VARCHAR — ex: SEDEX, PAC, .package)
- `tracking_code` (VARCHAR, nullable)
- `label_url` (VARCHAR, nullable)
- `status` (ENUM: quoted, label_generated, posted, in_transit, delivered, error)
- `shipping_cost` (DECIMAL)
- `estimated_days` (INTEGER)
- `quoted_options` (JSONB — array com todas as opções cotadas)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**`webhook_logs`** — log de webhooks recebidos (debug + auditoria)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK → tenants)
- `event_type` (VARCHAR — ex: order.created, order.updated)
- `payload_summary` (JSONB — resumo do payload, sem dados sensíveis)
- `status` (ENUM: processed, error, ignored)
- `error_message` (TEXT, nullable)
- `created_at` (TIMESTAMP)

### 3.2 Relacionamentos

```
tenant (1) → (N) orders
order (1) → (0..1) shipment
tenant (1) → (N) webhook_logs
```

### 3.3 Decisões de design

- **Sem tabela de products/inventory:** o Woo é dono do catálogo e estoque. A API só recebe os dados do pedido com peso/dimensões dos itens para cotar frete.
- **Sem tabela de users/auth:** autenticação é por API key, sem sessão, sem login. O `tenant` é a loja, não uma pessoa.
- **`quoted_options` no shipment:** armazena todas as opções de frete cotadas para o lojista poder escolher via API. Evita recotar.
- **`webhook_logs` separado:** facilita debug e auditoria sem poluir a tabela de orders.

---

## 4. Endpoints da API

### 4.1 Autenticação

Toda requisição deve incluir o header:

```
X-API-Key: wsk_live_xxxxxxxxxxxxx
```

Respostas de erro de auth:

- `401 Unauthorized` — chave ausente ou inválida
- `403 Forbidden` — tenant inativo

### 4.2 Webhooks (recebe do WooCommerce)

**`POST /webhooks/woocommerce`**

Recebe webhooks do WooCommerce. Validação via `X-WC-Webhook-Signature` (HMAC-SHA256).

Eventos tratados:

- `order.created` — cria registro em orders
- `order.updated` — atualiza status se relevante (ex: cancelamento)

Response: sempre `200 OK` (evita retentativas infinitas do Woo).

### 4.3 Cotação de Frete

**`POST /shipping/quote`**

Recebe dados do pedido e retorna opções de frete.

Request body:

```json
{
  "order_id": "woo_order_id ou internal_id",
  "to_zip": "60000000",
  "items": [
    { "weight": 0.5, "width": 15, "height": 10, "length": 20, "qty": 2 }
  ]
}
```

O CEP de origem (`from_zip`) é puxado automaticamente do cadastro do tenant. Pode ser sobrescrito opcionalmente com o campo `"from_zip"` no body.

Response:

```json
{
  "quote_id": "uuid",
  "options": [
    {
      "carrier": "correios",
      "service": "SEDEX",
      "cost": 25.9,
      "estimated_days": 3
    },
    {
      "carrier": "correios",
      "service": "PAC",
      "cost": 15.5,
      "estimated_days": 7
    }
  ]
}
```

### 4.4 Geração de Etiqueta

**`POST /shipping/label`**

Gera etiqueta para a opção escolhida.

Request body:

```json
{
  "order_id": "uuid",
  "selected_option": {
    "carrier": "correios",
    "service": "SEDEX"
  }
}
```

Response:

```json
{
  "shipment_id": "uuid",
  "tracking_code": "BR123456789BR",
  "label_url": "https://melhorenvio.com/labels/xxx.pdf",
  "carrier": "correios",
  "service": "SEDEX",
  "cost": 25.9
}
```

Efeito colateral: atualiza o pedido no WooCommerce via API com o `tracking_code` e status "completed" (job assíncrono na fila).

### 4.5 Consulta de Rastreio

**`GET /shipping/tracking/:trackingCode`**

Retorna status atual e timeline completa do envio, incluindo os eventos de preparação do pedido anteriores ao despacho físico. Autenticado via API key do tenant.

Response:

```json
{
  "tracking_code": "BR123456789BR",
  "current_status": "in_transit",
  "carrier": "Correios",
  "service": "SEDEX",
  "estimated_days": 3,
  "label_url": "https://melhorenvio.com/labels/xxx.pdf",
  "order": {
    "id": "uuid",
    "woo_order_id": 1042,
    "customer_name": "João Silva",
    "customer_email": "joao@email.com"
  },
  "timeline": [
    {
      "type": "preparation",
      "status": "order_received",
      "description": "Pedido recebido da loja",
      "location": null,
      "occurred_at": "2026-04-12T09:00:00Z"
    },
    {
      "type": "preparation",
      "status": "quoted",
      "description": "Frete cotado — Correios SEDEX",
      "location": null,
      "occurred_at": "2026-04-12T09:15:00Z"
    },
    {
      "type": "shipment",
      "status": "label_generated",
      "description": "Etiqueta gerada",
      "location": null,
      "occurred_at": "2026-04-12T09:20:00Z"
    },
    {
      "type": "shipment",
      "status": "in_transit",
      "description": "Objeto em trânsito",
      "location": "São Paulo/SP",
      "occurred_at": "2026-04-12T18:00:00Z"
    }
  ]
}
```

A página pública de tracking (`/tracking/:trackingCode` no frontend Next.js) consome este endpoint sem autenticação via proxy do Next.js.

### 4.6 Listagem de Pedidos

**`GET /orders`**

Lista pedidos do tenant. Query params: `?status=shipped&page=1&limit=20`

**`GET /orders/:id`**

Detalhe de um pedido com dados de shipment associado.

---

## 5. Fluxos Principais

### 5.1 Setup (único, manual)

1. Operador do WooStock gera uma API key para o lojista (via script/admin CLI no MVP)
2. Registra no banco: `store_url`, credenciais do Woo (criptografadas), token do Melhor Envio
3. Lojista configura no WooCommerce:
   - Webhook apontando para `POST {woostock_url}/webhooks/woocommerce` com evento `order.created` e `order.updated`
   - Plugin ou custom code que chama a API de cotação no checkout (opcional no MVP)

### 5.2 Pedido Novo

1. Cliente compra no WooCommerce
2. Woo dispara webhook `order.created` para o WooStock
3. WooStock valida assinatura HMAC
4. Cria registro em `orders` com dados do pedido (endereço, itens, peso)
5. Registra em `webhook_logs`
6. Retorna `200 OK`

### 5.3 Cotação e Despacho

1. Lojista (ou automação do Woo) chama `POST /shipping/quote` com dados do pedido
2. WooStock chama Melhor Envio API para cotar frete
3. Retorna opções (transportadora, preço, prazo)
4. Lojista escolhe opção e chama `POST /shipping/label`
5. WooStock gera etiqueta via Melhor Envio
6. Salva `shipment` com tracking_code e label_url
7. Job assíncrono: atualiza pedido no Woo com tracking_code via API REST do WooCommerce
8. Lojista baixa etiqueta pelo `label_url`

### 5.4 Atualização de Rastreio

1. Cron job a cada 30 minutos
2. Para cada shipment com status ≠ "delivered":
   - Consulta rastreio no Melhor Envio
   - Atualiza status local
   - Se mudou: job assíncrono atualiza nota no pedido do Woo via API
3. Lojista pode consultar via `GET /shipping/tracking/:id` a qualquer momento

### 5.5 Cancelamento

1. Webhook `order.updated` chega com status "cancelled"
2. Se shipment ainda não foi postado: marca como cancelado, não gera etiqueta
3. Se já foi postado: registra log, lojista resolve manualmente
4. Registra em `webhook_logs`

---

## 6. Segurança

### Autenticação

- API key no header `X-API-Key`
- Chave gerada pelo sistema no formato `wsk_live_xxxxxxxxxxxxxxxxxxxx` (prefixo identificável)
- Armazenada como hash (SHA-256) no banco — a chave em texto plano só é mostrada uma vez na criação
- Guard no NestJS valida hash e extrai `tenant_id` do registro associado

### Credenciais externas

- Credenciais do WooCommerce e token do Melhor Envio criptografados com AES-256 no banco
- Descriptografados apenas no momento da chamada à API externa
- Chave de criptografia em variável de ambiente

### Webhooks

- Validação via `X-WC-Webhook-Signature` (HMAC-SHA256)
- Rejeita webhook sem assinatura válida
- Retorna 200 mesmo em caso de erro de processamento (evita retentativas infinitas)

### API

- Rate limiting global: 100 req/min por IP
- Rate limiting por tenant: 60 req/min
- Helmet para headers de segurança
- CORS desabilitado (API pura, sem frontend)
- Payload máximo: 1MB

---

## 7. Error Handling

### API Layer

- Exception filter global no NestJS
- Respostas padronizadas:

```json
{
  "error": "SHIPPING_QUOTE_FAILED",
  "message": "Não foi possível cotar frete. Verifique o CEP de destino.",
  "statusCode": 422
}
```

- Erros 500 logam stack trace, retornam mensagem genérica ao cliente

### Job Processor (filas Bull)

- 3 retentativas com backoff exponencial (1s, 5s, 30s)
- Após 3 falhas: marca status como "error" no registro correspondente
- Jobs com falha ficam na dead letter queue para investigação

### Integrações externas (Woo + Melhor Envio)

- Timeout de 10s por chamada
- Circuit breaker: 5 falhas consecutivas → pausa 60s
- Toda chamada logada (request/response resumido) para debug

### Webhooks recebidos

- Processamento idempotente via unique constraint `(tenant_id, woo_order_id)`
- Webhook duplicado: atualiza em vez de duplicar
- Sempre retorna 200 OK
- Registra status em `webhook_logs`

---

## 8. Provisioning no MVP

Como não há cadastro/dashboard, o setup de novos tenants no MVP é feito via **CLI admin**:

```bash
# Criar novo tenant
npm run cli -- create-tenant \
  --name "Loja do João" \
  --store-url "https://lojadojoao.com.br" \
  --origin-zip "01001000" \
  --woo-key "ck_xxxxx" \
  --woo-secret "cs_xxxxx" \
  --melhor-envio-token "xxxxx"

# Output: API Key gerada (mostrada uma única vez)
# wsk_live_a1b2c3d4e5f6g7h8i9j0...
```

Esse CLI é um command do NestJS (`@nestjs/cli`) que roda localmente ou via SSH no servidor. Futuramente pode virar um painel admin ou um fluxo de self-service.

---

## 9. Fora do Escopo do MVP (Futuro)

**Entrega e transporte:**
- Infraestrutura de transporte próprio (entregadores, frota, roteirização) — MVP usa entrega mockada
- Integração com gateway de pagamento para cobrar taxa de entrega da loja após conclusão

**Produto:**
- Dashboard / painel admin para o lojista
- Cadastro self-service de tenants
- Plugin WooCommerce oficial (para facilitar setup)
- Notificações ao cliente (e-mail, WhatsApp com link de tracking)
- Relatórios e analytics de entregas
- Planos e billing automatizado

**Técnico:**
- Múltiplas lojas por tenant
- Gestão de produtos / catálogo / estoque
- Processamento de pagamentos do consumidor final
