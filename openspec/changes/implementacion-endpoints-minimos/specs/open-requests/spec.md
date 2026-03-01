## ADDED Requirements

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

