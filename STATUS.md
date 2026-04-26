# WooStock — Status de Implementação

> Baseado na especificação `README.md` · Atualizado em 2026-04-26

**Progresso geral estimado: ~75%** (fluxo principal de cotação, despacho e tracking operacional; filas assíncronas e segurança adicional pendentes)

---

## 1. Infraestrutura & Fundação ✅

- [x] NestJS + TypeScript bootstrap (`src/main.ts`)
- [x] Prisma ORM + MongoDB — 5 modelos definidos no schema
- [x] Swagger UI em `/docs`
- [x] Global `ValidationPipe` com `whitelist: true`
- [x] Configuração via `@nestjs/config` + `.env.example`

---

## 2. Autenticação — Módulo `api-keys` ✅

- [x] Geração de API key (64-char hex, prefixo `wsk_live_`)
- [x] Hash SHA-256 para armazenamento seguro
- [x] `ApiKeyGuard` — valida header `X-API-Key`, rejeita tenant inativo
- [x] Injeção de `tenantId` no request via guard
- [x] Decorator `@TenantId()` para controllers
- [x] Decorator `@Public()` para rotas abertas

---

## 3. Tenants — Módulo `tenants` ✅

- [x] `POST /tenants` — registro público, retorna API key + webhook secret + webhook URL completa (única vez)
- [x] `GET /tenants/me` — perfil autenticado com credenciais descriptografadas
- [x] `PATCH /tenants/me` — atualização com re-encriptação automática
- [x] `EncryptionService` AES-256-GCM com IV aleatório e scrypt key derivation
- [x] Auto-geração de `webhook_secret` (40-char hex)

---

## 4. Shipments — Módulo `shipments` ✅

> Gerenciamento de estado de envios (CRUD manual, sem integração externa ainda)

- [x] `POST /shipments` — cria envio com evento inicial
- [x] `GET /shipments` — lista por tenant, filtro opcional por status
- [x] `GET /shipments/:id` — detalhe com histórico de `ShipmentEvent`
- [x] `PATCH /shipments/:id/status` — atualiza status e registra evento automaticamente
- [x] Transações atômicas na criação e atualização

---

## 5. Orders — Módulo `orders` ✅

- [x] Módulo, controller e service em `src/orders/`
- [x] `GET /orders` — listagem com `?status=&page=&limit=` (paginação + filtro)
- [x] `GET /orders/:id` — detalhe com shipment associado
- [x] `OrdersService.upsertFromWoo` — idempotente via unique `(tenant_id, woo_order_id)`
- [x] Mapeamento de status WooCommerce → `OrderStatus` interno

---

## 6. Webhooks WooCommerce ✅

- [x] `POST /webhooks/woocommerce/:tenantId` — endpoint receptor por tenant
- [x] Validação de assinatura HMAC-SHA256 (`X-WC-Webhook-Signature`) com `timingSafeEqual`
- [x] Raw body habilitado no `NestExpressApplication` para HMAC correto
- [x] Processamento do evento `order.created` — cria registro em `orders`
- [x] Processamento do evento `order.updated` — atualiza pedido existente
- [x] Gravação em `WebhookLog` (sucesso ou erro com mensagem)
- [x] `WoocommerceSignatureGuard` rejeita tenant inativo / assinatura inválida

---

## 7. Cotação & Despacho — Módulo `shipping` ✅

- [x] `POST /shipping/quote` — cota frete via Melhor Envio (sandbox)
- [x] `POST /shipping/label` — gera etiqueta (cart → checkout → generate → print)
- [x] `GET /shipping/tracking/:trackingCode` — consulta status atual + timeline completa (eventos de preparação sintetizados + eventos reais do `ShipmentEvent`)
- [x] `MelhorEnvioService` — wrapper da API do Melhor Envio (calculate, cart, checkout, generate, print)
- [x] Leitura automática das credenciais criptografadas do tenant
- [x] Persistência de cotação em `Shipment.quoted_options` (evita recotar)
- [x] Schema `Shipment` com campos opcionais para suportar estado `quoted`
- [x] `ShipmentEvent` registrado quando etiqueta é gerada

---

## 8. WooCommerce Client ⚠️ Parcial

- [x] `WoocommerceService` — wrapper minimo da API REST v3 com Basic Auth
- [x] Atualização de pedido com `tracking_code` após geração de etiqueta (síncrono inline, best-effort)
- [x] Adição de nota visível ao cliente no pedido com o código de rastreio
- [x] Marcação do pedido como `completed` no Woo após despacho
- [ ] Sincronização de demais campos de status (cancelamento, devolução, etc.)

---

## 9. Filas & Jobs Assíncronos ❌

- [ ] Bull + Redis setup (`@nestjs/bull`)
- [ ] Job: atualizar pedido no WooCommerce após geração de etiqueta
- [ ] Job: cron a cada 30min para polling de rastreio nos envios ativos
- [ ] Retentativas com backoff exponencial (1s → 5s → 30s)
- [ ] Dead letter queue após 3 falhas

---

## 10. Segurança Adicional ❌

- [ ] Rate limiting global — 100 req/min por IP (`@nestjs/throttler`)
- [ ] Rate limiting por tenant — 60 req/min
- [ ] Helmet — security headers
- [ ] Payload máximo 1MB

---

## 11. Testes ❌

- [ ] Testes unitários (services, guards, encryption)
- [ ] Testes de integração (endpoints com banco real)

> ⚠️ Só existe `app.controller.spec.ts` como placeholder

---

## 12. Frontend — Página de Tracking ⚠️ Parcial

> `apps/web` — Next.js público, sem autenticação

- [x] Página `/tracking/[trackingCode]` — exibe status atual e timeline completa
- [x] Consume `GET /shipping/tracking/:trackingCode` via server component Next.js (proxy com `TRACKING_API_KEY`)
- [x] Design responsivo com estados: não encontrado (404), erro de serviço e timeline de eventos
- [x] Página `/` com formulário de busca por código de rastreio
- [ ] Deploy e configuração de domínio público

---

## 13. Billing & Taxa de Entrega ❌

> Modelo: WooStock cobra taxa da loja ao concluir cada entrega

- [ ] Modelo de dados para registrar taxa por entrega concluída
- [ ] Integração com gateway de pagamento (Stripe ou similar)
- [ ] Endpoint para consulta de faturas por tenant
- [ ] Webhook/job que dispara cobrança quando `shipment.status = delivered`

> ⚠️ Entrega física é mockada no MVP — este módulo depende da implementação do transporte real

---

## Resumo por Área

| Área | Status |
|------|--------|
| Infraestrutura | ✅ Completo |
| Autenticação | ✅ Completo |
| Tenants | ✅ Completo |
| Shipments (CRUD) | ✅ Completo |
| Orders | ✅ Completo |
| Webhooks WooCommerce | ✅ Completo (inbound) |
| Cotação & Despacho | ✅ Completo |
| WooCommerce Client | ⚠️ Parcial (só update de tracking) |
| Filas & Jobs | ❌ Não iniciado |
| Segurança adicional | ❌ Não iniciado |
| Testes | ❌ Não iniciado |
| Frontend — Tracking Page | ⚠️ Parcial (sem deploy) |
| Billing & Taxa de Entrega | ❌ Não iniciado |
