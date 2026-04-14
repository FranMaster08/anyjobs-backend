## Purpose

Definir el contrato funcional de la API de open requests para el MVP.

## Requirements

### Requirement: Open Requests API base path
El sistema MUST exponer la sub-API de open requests bajo el base path `/open-requests`.

#### Scenario: Open Requests API is reachable under /open-requests
- **WHEN** el cliente construye la URL de la API de open requests como `<host>/open-requests`
- **THEN** las rutas definidas en este spec responden bajo ese prefijo

### Requirement: List open requests with pagination
El sistema MUST exponer `GET /open-requests` con query params:

- `page: number` (min 1)
- `pageSize: number` (min 1; el front usa 12)
- `sort?: string` (opcional; valor esperado `publishedAtDesc`)

El sistema MUST responder `200` con JSON:

- `items: array` de objetos con:
  - `id: string`
  - `imageUrl: string`
  - `imageAlt: string`
  - `excerpt: string` (si vacío, el front hace fallback)
  - `tags: string[]`
  - `locationLabel: string`
  - `publishedAtLabel: string`
  - `budgetLabel: string`
- `nextPage: number | null`
- `hasMore: boolean`

`nextPage` MAY ser `null` siempre que `hasMore` sea consistente.

#### Scenario: List returns paginated structure
- **WHEN** el cliente llama `GET /open-requests?page=1&pageSize=12`
- **THEN** el sistema responde `200` con `items` array, `hasMore` boolean y `nextPage` number o null

### Requirement: Get open request detail by id
El sistema MUST exponer `GET /open-requests/{id}` y responder `200` con JSON que incluya al menos:

- `id: string`
- `title: string`
- `excerpt: string`
- `description: string`
- `tags: string[]`
- `locationLabel: string`
- `publishedAtLabel: string`
- `budgetLabel: string`
- `provider: object` con:
  - `name: string`
  - `badge: string`
  - `subtitle: string`
- `reputation: number` (rango esperado 0.0–5.0)
- `reviewsCount: number`
- `providerReviews: array` de objetos con:
  - `author: string`
  - `rating: number`
  - `dateLabel: string`
  - `text: string`
- `contactPhone: string`
- `contactEmail: string`
- `images: array` de objetos `{ url: string, alt: string }`

El campo `images` MUST existir y MUST ser un array (aunque sea `[]`).

#### Scenario: Detail always returns images array
- **WHEN** el cliente llama `GET /open-requests/{id}` para un id existente
- **THEN** el sistema responde `200` y el body incluye `images` como array

### Requirement: Not found uses message-only JSON
Si no existe el recurso solicitado, el sistema MUST responder `404` con `{ "message": "..." }`.

#### Scenario: Missing open request returns 404 with message
- **WHEN** el cliente llama `GET /open-requests/{id}` con un id inexistente
- **THEN** el sistema responde `404` con `{ "message": "<texto>" }`

## ADDED Requirements (CRUD autenticado)

### Requirement: Create open request (authenticated)

El sistema MUST exponer `POST /open-requests` protegido por autenticación Bearer y MUST validar el cuerpo JSON según el contrato de campos mutables (título, descripción, etiquetas, ubicación, presupuesto, contacto, imágenes opcionales).

El sistema MUST responder `201` con JSON compatible con el detalle (`OpenRequestDetailDto`).

#### Scenario: Authenticated client creates an open request

- **WHEN** un cliente autenticado con permiso `open-requests.create` envía `POST /open-requests` con un body válido
- **THEN** el sistema responde `201` y el body incluye el `id` del recurso creado

#### Scenario: Unauthenticated create is rejected

- **WHEN** un cliente sin token válido llama `POST /open-requests`
- **THEN** el sistema responde `401`

### Requirement: Update open request by id (authenticated)

El sistema MUST exponer `PATCH /open-requests/{id}` protegido por autenticación Bearer y MUST aplicar actualización parcial solo en campos enviados.

El titular MUST ser el mismo `userId` persistido en `owner_user_id`. Si `owner_user_id` es nulo (datos legados), el sistema MUST rechazar la mutación con `403`.

El sistema MUST responder `200` con el detalle actualizado.

#### Scenario: Owner updates their open request

- **WHEN** el titular autorizado envía `PATCH /open-requests/{id}` con cambios válidos
- **THEN** el sistema responde `200` y la persistencia refleja los cambios

#### Scenario: Non-owner cannot update

- **WHEN** un usuario autenticado con permiso pero distinto titular envía `PATCH /open-requests/{id}`
- **THEN** el sistema responde `403`

### Requirement: Delete open request by id (authenticated, soft delete)

El sistema MUST exponer `DELETE /open-requests/{id}` protegido por autenticación Bearer y MUST realizar baja lógica (`deleted_at`), excluyendo el recurso de listados y detalle públicos.

El titular MUST coincidir con `owner_user_id` (misma regla que en actualización).

El sistema MUST responder `204` sin cuerpo.

#### Scenario: Owner deletes their open request

- **WHEN** el titular autorizado llama `DELETE /open-requests/{id}` para un recurso existente y no eliminado
- **THEN** el sistema responde `204` y las lecturas públicas posteriores responden `404`

### Requirement: Validation for write operations

Para errores de validación en escritura, el sistema MUST responder `400` con el contrato de error global del API (p. ej. `errorCode` `VALIDATION.INVALID_INPUT`).

#### Scenario: Invalid create payload returns 400

- **WHEN** el cliente envía `POST /open-requests` con datos inválidos
- **THEN** el sistema responde `400` con el contrato de error de validación

