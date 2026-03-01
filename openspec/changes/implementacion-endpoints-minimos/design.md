# Design — AnyJobs Backend (NestJS Monorepo) 100% Compatible con AnyJobs Front (MVP)
> Enfoque: contratos **estables** (endpoints + DTOs) + estrategia **MVP-compatible** para OTP sin `userId`  
> Nota: la estructura DDD, Swagger obligatorio (decoradores compuestos) y config por env **ya están definidas** por reglas del repo (ver “Reglas del repo”).

---

## Context

- **Objetivo del cambio**: entregar un backend HTTP **100% compatible** con AnyJobs Front (Angular MVP) a nivel de contratos (endpoints + payloads).
- **Base URLs / sub-APIs**: el front apunta a base paths separados bajo un mismo host:
  - `/auth`, `/users`, `/open-requests`, `/site-config`, `/proposals`.
- **Restricciones relevantes**:
  - Mantener contratos “tal cual” (request/response/status codes) por compatibilidad.
  - El front hoy **no** envía automáticamente `Authorization: Bearer` (no interceptor) y `verify-email`/`verify-phone` **no** incluyen `userId` en request.

---

## Reglas del repo (ya definidas)

Este diseño **no re-define** estas áreas; se implementan según reglas existentes:

- **Arquitectura monorepo + DDD por módulo**: `.cursor/rules/anyjobs-backend-nestjs-monorepo-ddd.mdc`
- **Swagger obligatorio por endpoint (decoradores compuestos)**: `.cursor/rules/swagger-obligatorio-anyjobs-backend.mdc`
- **Configuración 100% por env + validación fail-fast**: `.cursor/rules/configuracion-por-env-anyjobs-backend.mdc`

---

## Goals / Non-Goals

### Goals

- Exponer endpoints y payloads compatibles para:
  - `auth`, `user-profile`, `open-requests`, `site-config`, `proposals`.
- Asegurar consistencia de errores en JSON simple: `{ "message": "..." }` para `4xx`.
- Diseñar una estrategia de autenticación **MVP-compatible** que permita `verify-email`/`verify-phone` sin `userId` (sin cambios inmediatos en el front).
- Definir una arquitectura que permita evolucionar a producción (auth robusta, persistencia real, observabilidad) sin romper contratos.

### Non-Goals

- Cambios de UI/Angular (interceptors, `withCredentials`, etc.).
- Matching, reputación avanzada, pagos y notificaciones reales (se permiten mocks en MVP).
- Definir “feature-completeness” más allá del set mínimo requerido por el front.

---

## Decisions

### 1) Mapeo de “sub-APIs” del front a base paths del backend

**Decisión**: un único servicio HTTP (Nest app `api`) que monta controladores con prefijos estables:

- `/auth`
- `/users`
- `/open-requests`
- `/site-config`
- `/proposals`

**Racional**: el front usa InjectionTokens con una URL por sub-API; mantener base paths evita cambios en Angular.

---

### 2) Autenticación “MVP-compatible” para OTP sin `userId`

**Problema**: `POST /auth/verify-email` y `POST /auth/verify-phone` reciben solo `{ otpCode }`, sin `userId` ni token.

**Decisión**: implementar un **Registration Flow** resoluble server-side mediante **cookie same-origin** (o mecanismo equivalente) para correlacionar:

- `POST /auth/register` crea usuario `PENDING` y **asocia flowId → userId**
- `verify-email`/`verify-phone` encuentran el `userId` a verificar usando **flowId** (sin pedirlo al cliente)

**Racional**: compatibilidad total con el front actual sin exigir interceptor ni `withCredentials` si el despliegue es same-origin.

**Plan de evolución (cuando no sea same-origin)**
- Reverse proxy para servir UI + API bajo el mismo dominio, o
- Evolucionar front a Bearer token + interceptor y usar guards.

---

### 3) Persistencia “render-first” en MVP

**Decisión**: `open-requests` y `site-config` pueden iniciar con dataset estático/configurable (in-memory o storage simple), y evolucionar a DB sin romper API.

**Racional**: desbloquea UI rápido y mantiene compatibilidad.

---

### 4) Versionado de contratos

**Decisión**: no introducir `/v1` en paths en MVP.

**Racional**: el front consume rutas sin versión; versionar rompe compatibilidad.

---

## DTO Catalog (Contratos completos)

> Convención: los DTOs viven en `apps/api/src/modules/<module>/api/dtos/`  
> Reglas:
> - Requests: propiedades opcionales solo cuando el front puede omitirlas.
> - Responses: mantener shape exacto esperado por el front.
> - Fechas: `YYYY-MM-DD` (date) y `ISO-8601` (datetime) como strings.

### Shared Enums

- `UserRole = "CLIENT" | "WORKER"`
- `RegistrationStatus = "PENDING" | "ACTIVE"`
- `RegistrationStage = "ACCOUNT" | "VERIFY" | "LOCATION" | "ROLE_PROFILE" | "PERSONAL_INFO" | "DONE"`
- `DocumentType = "DNI" | "NIE" | "PASSPORT"`
- `Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"`
- `PreferredPaymentMethod = "CARD" | "TRANSFER" | "CASH" | "WALLET"`

### Error DTOs (para 4xx)

**ErrorResponseDto**
- `message: string`

**ValidationErrorResponseDto (opcional / futuro)**
- `message: string`
- `fieldErrors?: Record<string, string>`

---

## Endpoints + DTOs (por sub-API)

> En todos los endpoints con body JSON:
> - Request header: `Content-Type: application/json`
> - Response header: `Content-Type: application/json; charset=utf-8` (si aplica)

---

# 1) Auth API — Base Path `/auth`

## 1.1 POST `/auth/register`

### RegisterRequestDto
- `fullName: string`
- `email: string`
- `phoneNumber: string`
- `password: string`
- `roles: UserRole[]` (min 1)

### RegisterResponseDto
- `userId: string`
- `status: RegistrationStatus` *(en MVP: "PENDING")*
- `emailVerificationRequired: boolean`
- `phoneVerificationRequired: boolean`
- `nextStage: RegistrationStage` *(en MVP: "VERIFY")*

### Responses
- `200 OK` → `RegisterResponseDto`
- `400 Bad Request` → `ErrorResponseDto`

---

## 1.2 POST `/auth/verify-email`

### VerifyOtpRequestDto
- `otpCode: string`

### Responses
- `204 No Content` (preferido)
- `200 OK` (body vacío / compatible)
- `400 Bad Request` → `ErrorResponseDto`
- `401 Unauthorized` → `ErrorResponseDto` *(si no existe flow activo)*

> Nota: el backend resuelve el usuario por `Registration Flow` (cookie same-origin).

---

## 1.3 POST `/auth/verify-phone`

Igual a `/auth/verify-email`.

---

## 1.4 GET `/auth/email-available?email=<email>`

### EmailAvailableResponseDto
- `available: boolean`

### Responses
- `200 OK` → `EmailAvailableResponseDto`

---

## 1.5 GET `/auth/phone-available?phoneNumber=<e164>`

### PhoneAvailableResponseDto
- `available: boolean`

### Responses
- `200 OK` → `PhoneAvailableResponseDto`

---

## 1.6 POST `/auth/login`

### LoginRequestDto
- `email: string`
- `password: string`

### UserDto (snapshot que devuelve login)

Campos requeridos por front:
- `id: string`
- `fullName: string`
- `email: string`
- `roles: UserRole[]`

Campos opcionales (front los tolera):
- `phoneNumber?: string` *(E.164)*
- `emailVerified?: boolean`
- `phoneVerified?: boolean`
- `status?: RegistrationStatus`
- `countryCode?: string` *(ej. "ES")*
- `city?: string`
- `area?: string`
- `coverageRadiusKm?: number`
- `workerCategories?: string[]`
- `workerHeadline?: string`
- `workerBio?: string`
- `preferredPaymentMethod?: PreferredPaymentMethod`
- `documentType?: DocumentType`
- `documentNumber?: string`
- `birthDate?: string` *(YYYY-MM-DD)*
- `gender?: Gender`
- `nationality?: string`
- `createdAt?: string` *(ISO-8601 datetime)*

### LoginResponseDto
- `token: string`
- `user: UserDto`

### Responses
- `200 OK` → `LoginResponseDto`
- `401 Unauthorized` → `ErrorResponseDto`

---

# 2) Users API — Base Path `/users`

> Nota: todas las rutas son para “mi usuario” → `/users/me/...`

## 2.1 PATCH `/users/me/location`

### UpdateLocationRequestDto
- `city: string` *(requerido)*
- `area?: string`
- `countryCode?: string`
- `coverageRadiusKm?: number`

### Responses
- `204 No Content`
- `400 Bad Request` → `ErrorResponseDto`
- `401 Unauthorized` → `ErrorResponseDto`

---

## 2.2 PATCH `/users/me/worker-profile`

### UpdateWorkerProfileRequestDto
- `categories: string[]` *(min 1 si el usuario es WORKER)*
- `headline?: string`
- `bio?: string`

### Responses
- `204 No Content`
- `400 Bad Request` → `ErrorResponseDto`
- `401 Unauthorized` → `ErrorResponseDto`

---

## 2.3 PATCH `/users/me/client-profile`

### UpdateClientProfileRequestDto
- `preferredPaymentMethod: PreferredPaymentMethod`

### Responses
- `204 No Content`
- `400 Bad Request` → `ErrorResponseDto`
- `401 Unauthorized` → `ErrorResponseDto`

---

## 2.4 PATCH `/users/me/personal-info`

### UpdatePersonalInfoRequestDto
- `documentType: DocumentType`
- `documentNumber: string` *(front valida min 5, max 24)*
- `birthDate: string` *(YYYY-MM-DD)*
- `gender?: Gender`
- `nationality?: string`

### Responses
- `204 No Content`
- `400 Bad Request` → `ErrorResponseDto`
- `401 Unauthorized` → `ErrorResponseDto`

---

# 3) Open Requests API — Base Path `/open-requests`

## 3.1 GET `/open-requests?page=<n>&pageSize=<n>&sort=publishedAtDesc`

### OpenRequestListItemDto
- `id: string`
- `imageUrl: string`
- `imageAlt: string`
- `excerpt: string`
- `tags: string[]`
- `locationLabel: string`
- `publishedAtLabel: string`
- `budgetLabel: string`

### OpenRequestsListResponseDto
- `items: OpenRequestListItemDto[]`
- `nextPage: number | null`
- `hasMore: boolean`

### Responses
- `200 OK` → `OpenRequestsListResponseDto`
- `400 Bad Request` → `ErrorResponseDto`

---

## 3.2 GET `/open-requests/{id}`

### ProviderDto
- `name: string`
- `badge: string`
- `subtitle: string`

### ProviderReviewDto
- `author: string`
- `rating: number` *(1..5)*
- `dateLabel: string`
- `text: string`

### ImageDto
- `url: string`
- `alt: string`

### OpenRequestDetailDto
- `id: string`
- `title: string`
- `excerpt: string`
- `description: string`
- `tags: string[]`
- `locationLabel: string`
- `publishedAtLabel: string`
- `budgetLabel: string`
- `provider: ProviderDto`
- `reputation: number` *(0.0..5.0)*
- `reviewsCount: number`
- `providerReviews: ProviderReviewDto[]`
- `contactPhone: string`
- `contactEmail: string`
- `images: ImageDto[]` *(MUST existir, puede ser `[]`)*

### Responses
- `200 OK` → `OpenRequestDetailDto`
- `404 Not Found` → `ErrorResponseDto`

---

# 4) Site Config API — Base Path `/site-config`

## 4.1 GET `/site-config`

### SiteHeroDto
- `title: string`
- `subtitle: string`

### SiteRequestsSectionDto
- `label: string`
- `title: string`
- `cta: string`

### SiteLocationPreviewDto
- `title: string`
- `hintNoLocation: string`
- `hintWithLocation: string`

### SiteLocationSectionDto
- `label: string`
- `title: string`
- `body: string`
- `openMap: string`
- `viewMap: string`
- `preview: SiteLocationPreviewDto`

### SiteContactValueDto
- `label: string`
- `value: string`
- `hint: string`
- `href: string`

### SiteContactSectionDto
- `label: string`
- `title: string`
- `intro: string`
- `phone: SiteContactValueDto`
- `email: SiteContactValueDto`

### SiteSectionsDto
- `requests: SiteRequestsSectionDto`
- `location: SiteLocationSectionDto`
- `contact: SiteContactSectionDto`

### SiteConfigResponseDto
- `brandName: string`
- `hero: SiteHeroDto`
- `sections: SiteSectionsDto`

### Responses
- `200 OK` → `SiteConfigResponseDto`

---

# 5) Proposals API — Base Path `/proposals` (recomendado para producción)

## 5.1 GET `/proposals?userId=<id>&requestId=<id>`

### ProposalAuthorDto
- `name: string`
- `subtitle: string`
- `rating?: number`
- `reviewsCount?: number`

### ProposalDto
- `id: string`
- `requestId: string`
- `userId: string`
- `author: ProposalAuthorDto`
- `whoAmI: string`
- `message: string`
- `estimate: string`
- `createdAt: string` *(ISO-8601 datetime)*
- `status: "SENT"`

### Responses
- `200 OK` → `ProposalDto[]`

---

## 5.2 POST `/proposals`

### CreateProposalRequestDto (CreateProposalInput)
- `requestId: string`
- `userId: string`
- `authorName: string`
- `authorSubtitle: string`
- `whoAmI: string`
- `message: string`
- `estimate: string`

### CreateProposalResponseDto (Proposal)
- `id: string`
- `requestId: string`
- `userId: string`
- `author: { name: string, subtitle: string }`
- `whoAmI: string`
- `message: string`
- `estimate: string`
- `createdAt: string` *(ISO-8601 datetime)*
- `status: "SENT"`

### Responses
- `201 Created` (preferido) o `200 OK` → `CreateProposalResponseDto`
- `400 Bad Request` → `ErrorResponseDto`

---

## Contract Testing (mínimo)

- Colección Postman o e2e con estos checks:
  - Shapes exactos (campos esperados)
  - Status codes
  - `images` siempre array en open-request detail
  - `verify-email/phone` funciona sin `userId` (via flow cookie)
  - Errores `4xx` devuelven `{ "message": "..." }`

---

## Risks / Trade-offs

- **[Riesgo] OTP flow depende de same-origin**
  - **Mitigación**: reverse proxy para UI+API bajo mismo dominio; plan de evolución a Bearer + interceptor.
- **[Riesgo] Contratos rígidos frenan refactors**
  - **Mitigación**: DTOs explícitos + tests de contrato (y Swagger según regla del repo).
- **[Riesgo] Datos mock en open-requests/site-config**
  - **Mitigación**: encapsular acceso a datos para migrar a DB sin romper API.
- **[Riesgo] Sin interceptor en front reduce seguridad real**
  - **Mitigación**: MVP prioriza compatibilidad; evolución planeada a guards + Bearer.

