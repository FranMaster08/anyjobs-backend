## AnyJobs Backend

Backend de AnyJobs basado en **NestJS monorepo** con **DDD por módulo** y foundations transversales: configuración por env con validación fail-fast, correlation id, logging, contrato único de errores, RBAC deny-by-default, Swagger y testing (unit + e2e).

## Requisitos
- Node.js 18.x (NestJS v10)
- npm

## Setup rápido
1) Instalar dependencias

```bash
npm install
```

2) Crear `.env` desde `.env.example`

```bash
cp .env.example .env
```

3) Levantar API

```bash
npm run start:api:dev
```

## Scripts
- Dev API: `npm run start:api:dev`
- Start API: `npm run start:api`
- Build: `npm run build`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`

## Variables de entorno
Ver `.env.example`. Variables mínimas:
- `APP_PORT`
- `LOG_LEVEL` (debug|log|warn|error)
- `LOG_DEBUG_PAYLOADS` (true|false)
- `PAGINATION_DEFAULT_PAGE_SIZE`
- `PAGINATION_MAX_PAGE_SIZE`
- `SWAGGER_ENABLED` (true|false)
- `SWAGGER_PATH` (ej. docs)

La app no inicia si faltan variables requeridas (fail-fast).

## Convenciones de API
### Correlation ID
- Header de entrada/salida: `x-correlation-id`
- Si no viene, se genera; siempre se propaga y aparece en logs y en el contrato de error.

### Contrato de error
Todas las respuestas de error siguen un contrato único:
- `status`
- `errorCode`
- `message`
- `technicalMessage`
- `correlationId`
- `timestamp`
- `details` (solo cuando aplica, por ejemplo validación)

Formato mínimo para humanos (siempre presente como parte del contrato):

```json
{ "message": "..." }
```

### Autenticación y RBAC (deny-by-default)
- Por defecto todo endpoint es privado.
- Sin `Authorization: Bearer <token>`: 401
- Con auth válida pero sin permiso: 403
- Si un endpoint no declara metadata RBAC: 403 (deny-by-default)

Para pruebas E2E se usa un stub simple vía headers:
- `authorization: Bearer test-token`
- `x-permissions: permission.a,permission.b`
- `x-roles: role.a,role.b`

### Paginación
- Toda búsqueda/listado es paginada.
- Respuesta paginada siempre incluye `items` y `meta` (con `totalItems`, `page`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`, `nextPage`, `previousPage`).
- `pageSize` tiene máximo configurado por env.

### Swagger
- Si `SWAGGER_ENABLED=true`, Swagger se publica en `/{SWAGGER_PATH}` (por defecto `/docs`).
- Los controllers deben mantenerse limpios; la documentación Swagger vive en `apps/api/src/modules/<module>/api/swagger/` como decoradores compuestos.

## Estructura (DDD por módulo)
Los módulos viven en `apps/api/src/modules/<module>/` con carpetas:
- `domain/` (puro: sin Nest/HTTP/DB)
- `application/` (use-cases + `application/ports/*`)
- `infrastructure/` (adaptadores concretos)
- `api/` (controllers + dtos + swagger)

## Endpoints
### GET /health
Propósito:
- Health check del servicio para uso externo.
- Útil para uptime y readiness superficial.

Autenticación:
- Ninguna (público)

Request:
- Sin body
- Headers opcionales: `x-correlation-id`

Ejemplo:

```bash
curl -s http://localhost:${APP_PORT}/health
```

Response:
- 200: `HealthResponseDto`

Campos (`HealthResponseDto`):
- `status`: 'ok' (requerido) - estado del servicio

Ejemplo:

```json
{ "status": "ok" }
```

Errores:
- 5xx: contrato estándar de error

Eventos:
- Publica: ninguno
- Consume: ninguno

### GET /health/secure
Propósito:
- Endpoint de referencia para validar RBAC.

Autenticación:
- Bearer
- Permiso requerido: `health.read`

Request:
- Sin body

Ejemplo:

```bash
curl -s -H "Authorization: Bearer test-token" -H "x-permissions: health.read" http://localhost:${APP_PORT}/health/secure
```

Response:
- 200: `HealthResponseDto`

Errores:
- 401: sin auth válida
- 403: sin permiso requerido

Eventos:
- Publica: ninguno
- Consume: ninguno

### GET /health/deny
Propósito:
- Endpoint de referencia para verificar deny-by-default cuando falta metadata RBAC.

Autenticación:
- Bearer

Request:
- Sin body

Ejemplo:

```bash
curl -s -H "Authorization: Bearer test-token" http://localhost:${APP_PORT}/health/deny
```

Response:
- 200: `HealthResponseDto` (solo si se define RBAC explícito; hoy se espera deny)

Errores:
- 401: sin auth válida
- 403: deny-by-default (no hay metadata RBAC)

Eventos:
- Publica: ninguno
- Consume: ninguno

### POST /auth/register
Propósito:
- Inicia el flujo de registro (MVP) y crea un usuario.
- Devuelve el estado y el próximo paso del flujo.

Autenticación:
- Ninguna (público)

Request (`RegisterRequestDto`):
- `fullName`: string (requerido) - nombre completo - no vacío
- `email`: string (requerido) - email - formato email
- `phoneNumber`: string (requerido) - teléfono - no vacío (formato E.164 esperado)
- `password`: string (requerido) - contraseña (MVP) - minLength 6
- `roles`: array<'CLIENT'|'WORKER'> (requerido) - roles - min 1, valores permitidos CLIENT/WORKER

Ejemplo:

```json
{
  "fullName": "María García",
  "email": "maria@example.com",
  "phoneNumber": "+34600111222",
  "password": "S3gura!123",
  "roles": ["WORKER"]
}
```

Response:
- 200: `RegisterResponseDto`
- Set-Cookie: `aj_reg_flow=<flowId>` (httpOnly, path `/auth`)

Campos (`RegisterResponseDto`):
- `userId`: string (requerido) - id del usuario
- `status`: 'PENDING'|'ACTIVE' (requerido) - estado de registro
- `emailVerificationRequired`: boolean (requerido) - requiere verificación de email
- `phoneVerificationRequired`: boolean (requerido) - requiere verificación de teléfono
- `nextStage`: 'ACCOUNT'|'VERIFY'|'LOCATION'|'ROLE_PROFILE'|'PERSONAL_INFO'|'DONE' (requerido) - próxima etapa

Ejemplo:

```json
{
  "userId": "a0b1c2d3-e4f5-6789-aaaa-bbbbccccdddd",
  "status": "PENDING",
  "emailVerificationRequired": true,
  "phoneVerificationRequired": true,
  "nextStage": "VERIFY"
}
```

Errores:
- 400: validación de DTO
- 409: conflicto (si aplica por reglas de negocio)

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### POST /auth/verify-email
Propósito:
- Verifica OTP de email para completar etapa del registro.

Autenticación:
- Ninguna (público)
- Requiere cookie de flujo: `aj_reg_flow` (emitida por `POST /auth/register`)

Request (`VerifyOtpRequestDto`):
- `otpCode`: string (requerido) - código OTP (MVP) - no vacío

Ejemplo:

```json
{ "otpCode": "123456" }
```

Response:
- 204: sin body

Errores:
- 400: validación de DTO
- 401: falta cookie `aj_reg_flow` o flow inválido

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### POST /auth/verify-phone
Propósito:
- Verifica OTP de teléfono para completar etapa del registro.

Autenticación:
- Ninguna (público)
- Requiere cookie de flujo: `aj_reg_flow` (emitida por `POST /auth/register`)

Request (`VerifyOtpRequestDto`):
- `otpCode`: string (requerido) - código OTP (MVP) - no vacío

Ejemplo:

```json
{ "otpCode": "123456" }
```

Response:
- 204: sin body

Errores:
- 400: validación de DTO
- 401: falta cookie `aj_reg_flow` o flow inválido

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### GET /auth/email-available
Propósito:
- Consulta si un email está disponible.

Autenticación:
- Ninguna (público)

Request:
- Query params:
  - `email`: string (requerido) - email a consultar

Ejemplo:

```bash
curl -s "http://localhost:${APP_PORT}/auth/email-available?email=maria@example.com"
```

Response:
- 200: `EmailAvailableResponseDto`

Campos (`EmailAvailableResponseDto`):
- `available`: boolean (requerido) - indica si el email está disponible

Ejemplo:

```json
{ "available": true }
```

Errores:
- 400: query inválida (si aplica)

Eventos:
- Publica: ninguno
- Consume: ninguno

### GET /auth/phone-available
Propósito:
- Consulta si un teléfono está disponible.

Autenticación:
- Ninguna (público)

Request:
- Query params:
  - `phoneNumber`: string (requerido) - teléfono a consultar

Ejemplo:

```bash
curl -s "http://localhost:${APP_PORT}/auth/phone-available?phoneNumber=%2B34600111222"
```

Response:
- 200: `PhoneAvailableResponseDto`

Campos (`PhoneAvailableResponseDto`):
- `available`: boolean (requerido) - indica si el teléfono está disponible

Ejemplo:

```json
{ "available": true }
```

Errores:
- 400: query inválida (si aplica)

Eventos:
- Publica: ninguno
- Consume: ninguno

### POST /auth/login
Propósito:
- Autentica usuario (MVP) y devuelve token.

Autenticación:
- Ninguna (público)

Request (`LoginRequestDto`):
- `email`: string (requerido) - email - formato email
- `password`: string (requerido) - contraseña - no vacío

Ejemplo:

```json
{ "email": "maria@example.com", "password": "S3gura!123" }
```

Response:
- 200: `LoginResponseDto`

Campos (`LoginResponseDto`):
- `token`: string (requerido) - token de sesión (MVP)
- `user`: `UserDto` (requerido) - usuario autenticado

Campos (`UserDto`) usados por el front:
- `id`: string (requerido)
- `fullName`: string (requerido)
- `email`: string (requerido)
- `roles`: array<'CLIENT'|'WORKER'> (requerido)

Ejemplo:

```json
{
  "token": "b5b3a1b8-9d2e-4e7c-9b58-23d6b38e57f0",
  "user": {
    "id": "a0b1c2d3-e4f5-6789-aaaa-bbbbccccdddd",
    "fullName": "María García",
    "email": "maria@example.com",
    "roles": ["WORKER"]
  }
}
```

Errores:
- 400: validación de DTO
- 401: credenciales inválidas

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### GET /site-config
Propósito:
- Devuelve configuración pública del sitio (textos/labels) para el front.

Autenticación:
- Ninguna (público)

Request:
- Sin body

Ejemplo:

```bash
curl -s http://localhost:${APP_PORT}/site-config
```

Response:
- 200: `SiteConfigResponseDto`

Campos (`SiteConfigResponseDto`):
- `brandName`: string (requerido)
- `hero`: `SiteHeroDto` (requerido)
- `sections`: `SiteSectionsDto` (requerido)

Campos (`SiteHeroDto`):
- `title`: string (requerido)
- `subtitle`: string (requerido)

Campos (`SiteSectionsDto`):
- `requests`: `SiteRequestsSectionDto` (requerido)
- `location`: `SiteLocationSectionDto` (requerido)
- `contact`: `SiteContactSectionDto` (requerido)

Ejemplo:

```json
{
  "brandName": "AnyJobs",
  "hero": { "title": "Encuentra ayuda cerca de ti", "subtitle": "Profesionales verificados para tus necesidades." },
  "sections": {
    "requests": { "label": "Solicitudes", "title": "Últimas solicitudes", "cta": "Ver más" },
    "location": {
      "label": "Ubicación",
      "title": "Busca por zona",
      "body": "Elige tu zona para ver profesionales disponibles.",
      "openMap": "Abrir mapa",
      "viewMap": "Ver mapa",
      "preview": {
        "title": "Tu zona",
        "hintNoLocation": "Selecciona una ubicación para ver solicitudes cerca.",
        "hintWithLocation": "Mostrando solicitudes cerca de tu ubicación."
      }
    },
    "contact": {
      "label": "Contacto",
      "title": "¿Necesitas ayuda?",
      "intro": "Escríbenos o llámanos y te ayudamos.",
      "phone": { "label": "Teléfono", "value": "+34 600 111 222", "hint": "L-V 9:00-18:00", "href": "tel:+34600111222" },
      "email": { "label": "Email", "value": "contacto@example.com", "hint": "Respuesta en 24h", "href": "mailto:contacto@example.com" }
    }
  }
}
```

Errores:
- 5xx: contrato estándar de error

Eventos:
- Publica: ninguno
- Consume: ninguno

### GET /open-requests
Propósito:
- Lista solicitudes abiertas para el home/browse del front.

Autenticación:
- Ninguna (público)

Request:
- Query params:
  - `page`: number (opcional) - página 1-based - default 1
  - `pageSize`: number (opcional) - tamaño de página - default por env, max por env
  - `sort`: string (opcional) - actualmente ignorado; orden default `publishedAt desc`

Ejemplo:

```bash
curl -s "http://localhost:${APP_PORT}/open-requests?page=1&pageSize=12"
```

Response:
- 200: `OpenRequestsListResponseDto` (paginado)
- `items`: `OpenRequestListItemDto[]`
- `meta`: `PageMetaDto`
- Compat MVP: `nextPage`, `hasMore`

Campos (`OpenRequestsListResponseDto`):
- `items`: `OpenRequestListItemDto[]` (requerido)
- `meta`: `PageMetaDto` (requerido)
- `nextPage`: number|null (requerido) - compat MVP
- `hasMore`: boolean (requerido) - compat MVP

Campos (`OpenRequestListItemDto`):
- `id`: string (requerido)
- `imageUrl`: string (requerido)
- `imageAlt`: string (requerido)
- `excerpt`: string (requerido)
- `tags`: string[] (requerido)
- `locationLabel`: string (requerido)
- `publishedAtLabel`: string (requerido)
- `budgetLabel`: string (requerido)

Campos (`PageMetaDto`):
- `totalItems`: number (requerido)
- `page`: number (requerido) - 1-based
- `pageSize`: number (requerido)
- `totalPages`: number (requerido)
- `hasNextPage`: boolean (requerido)
- `hasPreviousPage`: boolean (requerido)
- `nextPage`: number|null (requerido)
- `previousPage`: number|null (requerido)

Ejemplo:

```json
{
  "items": [
    {
      "id": "req-1",
      "imageUrl": "https://picsum.photos/seed/req-1/640/360",
      "imageAlt": "Imagen de la solicitud",
      "excerpt": "Necesito ayuda con una limpieza profunda.",
      "tags": ["Limpieza"],
      "locationLabel": "Barcelona · Eixample",
      "publishedAtLabel": "Hace 2 días",
      "budgetLabel": "€60"
    }
  ],
  "meta": {
    "totalItems": 120,
    "page": 1,
    "pageSize": 12,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2,
    "previousPage": null
  },
  "nextPage": 2,
  "hasMore": true
}
```

Errores:
- 400: parámetros de paginación inválidos

Eventos:
- Publica: ninguno
- Consume: ninguno

### GET /open-requests/:id
Propósito:
- Devuelve el detalle de una solicitud abierta para su pantalla de detalle.

Autenticación:
- Ninguna (público)

Request:
- Path params:
  - `id`: string (requerido) - id de la solicitud

Ejemplo:

```bash
curl -s http://localhost:${APP_PORT}/open-requests/req-1
```

Response:
- 200: `OpenRequestDetailDto`

Campos (`OpenRequestDetailDto`):
- `id`: string (requerido)
- `title`: string (requerido)
- `excerpt`: string (requerido)
- `description`: string (requerido)
- `tags`: string[] (requerido)
- `locationLabel`: string (requerido)
- `publishedAtLabel`: string (requerido)
- `budgetLabel`: string (requerido)
- `provider`: `ProviderDto` (requerido)
- `reputation`: number (requerido)
- `reviewsCount`: number (requerido)
- `providerReviews`: `ProviderReviewDto[]` (requerido)
- `contactPhone`: string (requerido)
- `contactEmail`: string (requerido)
- `images`: `ImageDto[]` (requerido)

Ejemplo:

```json
{
  "id": "req-1",
  "title": "Limpieza profunda de piso",
  "excerpt": "Necesito una limpieza profunda.",
  "description": "Descripción completa...",
  "tags": ["Limpieza"],
  "locationLabel": "Barcelona · Eixample",
  "publishedAtLabel": "Hace 2 días",
  "budgetLabel": "€60",
  "provider": { "name": "Limpiezas Express", "badge": "PRO", "subtitle": "Responde en 1h" },
  "reputation": 4.8,
  "reviewsCount": 120,
  "providerReviews": [{ "author": "Ana", "rating": 5, "dateLabel": "Ene 2026", "text": "Muy buen servicio." }],
  "contactPhone": "+34600111222",
  "contactEmail": "contacto@example.com",
  "images": [{ "url": "https://picsum.photos/seed/img-1/800/600", "alt": "Imagen adjunta" }]
}
```

Errores:
- 404: no existe la solicitud

Eventos:
- Publica: ninguno
- Consume: ninguno

### GET /proposals
Propósito:
- Lista propuestas (filtrables) para usuario/solicitud.

Autenticación:
- Bearer
- Permiso requerido: `proposals.read`

Request:
- Query params:
  - `userId`: string (opcional) - filtra por usuario
  - `requestId`: string (opcional) - filtra por solicitud
  - `page`: number (opcional) - página 1-based - default 1
  - `pageSize`: number (opcional) - tamaño de página - default por env, max por env

Ejemplo:

```bash
curl -s -H "Authorization: Bearer test-token" -H "x-permissions: proposals.read" "http://localhost:${APP_PORT}/proposals?page=1&pageSize=12"
```

Response:
- 200: `ProposalsListResponseDto` (paginado)

Campos (`ProposalsListResponseDto`):
- `items`: `ProposalDto[]` (requerido)
- `meta`: `PageMetaDto` (requerido)

Ejemplo:

```json
{
  "items": [
    {
      "id": "prop-1",
      "requestId": "req-1",
      "userId": "user-1",
      "author": { "name": "María", "subtitle": "Profesional" },
      "whoAmI": "Soy profesional de limpieza...",
      "message": "Puedo hacerlo esta semana.",
      "estimate": "€60",
      "createdAt": "2026-03-01T18:30:00.000Z",
      "status": "SENT"
    }
  ],
  "meta": {
    "totalItems": 1,
    "page": 1,
    "pageSize": 12,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false,
    "nextPage": null,
    "previousPage": null
  }
}
```

Errores:
- 401: sin auth válida
- 403: sin permiso requerido
- 400: parámetros inválidos

Eventos:
- Publica: ninguno
- Consume: ninguno

### POST /proposals
Propósito:
- Crea una propuesta para una solicitud (MVP).

Autenticación:
- Bearer
- Permiso requerido: `proposals.create`

Request (`CreateProposalRequestDto`):
- `requestId`: string (requerido) - id de la solicitud - no vacío
- `userId`: string (requerido) - id del usuario - no vacío
- `authorName`: string (requerido) - nombre visible del autor - no vacío
- `authorSubtitle`: string (requerido) - subtítulo visible - no vacío
- `whoAmI`: string (requerido) - presentación - no vacío
- `message`: string (requerido) - mensaje - no vacío
- `estimate`: string (requerido) - estimación - no vacío

Ejemplo:

```json
{
  "requestId": "req-1",
  "userId": "user-1",
  "authorName": "María",
  "authorSubtitle": "Profesional",
  "whoAmI": "Soy profesional de limpieza...",
  "message": "Puedo hacerlo esta semana.",
  "estimate": "€60"
}
```

Response:
- 201: `ProposalDto`

Campos (`ProposalDto`):
- `id`: string (requerido)
- `requestId`: string (requerido)
- `userId`: string (requerido)
- `author`: `ProposalAuthorDto` (requerido)
- `whoAmI`: string (requerido)
- `message`: string (requerido)
- `estimate`: string (requerido)
- `createdAt`: string (requerido) - ISO 8601
- `status`: 'SENT' (requerido)

Campos (`ProposalAuthorDto`):
- `name`: string (requerido)
- `subtitle`: string (requerido)
- `rating`: number (opcional)
- `reviewsCount`: number (opcional)

Ejemplo:

```json
{
  "id": "prop-1",
  "requestId": "req-1",
  "userId": "user-1",
  "author": { "name": "María", "subtitle": "Profesional" },
  "whoAmI": "Soy profesional de limpieza...",
  "message": "Puedo hacerlo esta semana.",
  "estimate": "€60",
  "createdAt": "2026-03-01T18:30:00.000Z",
  "status": "SENT"
}
```

Errores:
- 400: validación de DTO
- 401: sin auth válida
- 403: sin permiso requerido
- 409: conflicto (si aplica por reglas de negocio)

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### PATCH /users/me/location
Propósito:
- Actualiza ubicación del usuario autenticado.

Autenticación:
- Bearer
- Permiso requerido: `users.me.write`

Request (`UpdateLocationRequestDto`):
- `city`: string (requerido) - ciudad - no vacío
- `area`: string (opcional) - zona/área
- `countryCode`: string (opcional) - código de país (ej. ES)
- `coverageRadiusKm`: number (opcional) - radio en km - min 0

Ejemplo:

```json
{ "city": "Barcelona", "area": "Eixample", "countryCode": "ES", "coverageRadiusKm": 10 }
```

Response:
- 204: sin body

Errores:
- 400: validación de DTO
- 401: sin auth válida
- 403: sin permiso requerido

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### PATCH /users/me/worker-profile
Propósito:
- Actualiza el perfil de worker del usuario autenticado.

Autenticación:
- Bearer
- Permiso requerido: `users.me.write`

Request (`UpdateWorkerProfileRequestDto`):
- `categories`: string[] (requerido) - categorías - min 1
- `headline`: string (opcional) - titular - no vacío si se envía
- `bio`: string (opcional) - bio - no vacío si se envía

Ejemplo:

```json
{ "categories": ["Limpieza"], "headline": "Profesional con experiencia", "bio": "Trabajo rápido y cuidadoso." }
```

Response:
- 204: sin body

Errores:
- 400: validación de DTO
- 401: sin auth válida
- 403: sin permiso requerido

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### PATCH /users/me/client-profile
Propósito:
- Actualiza preferencias de cliente del usuario autenticado.

Autenticación:
- Bearer
- Permiso requerido: `users.me.write`

Request (`UpdateClientProfileRequestDto`):
- `preferredPaymentMethod`: 'CARD'|'TRANSFER'|'CASH'|'WALLET' (requerido) - método de pago preferido

Ejemplo:

```json
{ "preferredPaymentMethod": "CARD" }
```

Response:
- 204: sin body

Errores:
- 400: validación de DTO
- 401: sin auth válida
- 403: sin permiso requerido

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

### PATCH /users/me/personal-info
Propósito:
- Actualiza información personal del usuario autenticado.

Autenticación:
- Bearer
- Permiso requerido: `users.me.write`

Request (`UpdatePersonalInfoRequestDto`):
- `documentType`: 'DNI'|'NIE'|'PASSPORT' (requerido) - tipo de documento
- `documentNumber`: string (requerido) - número de documento - min 5, max 24
- `birthDate`: string (requerido) - fecha (YYYY-MM-DD) - regex
- `gender`: 'MALE'|'FEMALE'|'OTHER'|'PREFER_NOT_TO_SAY' (opcional) - género
- `nationality`: string (opcional) - nacionalidad

Ejemplo:

```json
{
  "documentType": "DNI",
  "documentNumber": "12345678A",
  "birthDate": "1990-01-31",
  "gender": "FEMALE",
  "nationality": "ES"
}
```

Response:
- 204: sin body

Errores:
- 400: validación de DTO
- 401: sin auth válida
- 403: sin permiso requerido

Eventos:
- Publica: ninguno (MVP)
- Consume: ninguno

## Checklist de PR (gate)
- README actualizado con endpoints afectados
- Ejemplos de payload actualizados
- Status codes y errores documentados
- Eventos documentados (si aplica)
