## ADDED Requirements

### Requirement: Proposals API base path
El sistema MUST exponer la sub-API de proposals bajo el base path `/proposals`.

#### Scenario: Proposals API is reachable under /proposals
- **WHEN** el cliente construye la URL de la API de proposals como `<host>/proposals`
- **THEN** las rutas definidas en este spec responden bajo ese prefijo

### Requirement: List proposals with filters
El sistema MUST exponer `GET /proposals` con filtros opcionales:

- `userId?: string`
- `requestId?: string`

El sistema MUST responder `200` con un JSON array de objetos con:

- `id: string`
- `requestId: string`
- `userId: string`
- `author: { name: string, subtitle: string, rating?: number, reviewsCount?: number }`
- `whoAmI: string`
- `message: string`
- `estimate: string`
- `createdAt: string` (ISO-8601 datetime)
- `status: "SENT"`

#### Scenario: List proposals filtered by requestId
- **WHEN** el cliente llama `GET /proposals?requestId=<id>`
- **THEN** el sistema responde `200` y el body es un array

### Requirement: Create proposal
El sistema MUST aceptar `POST /proposals` con body JSON:

- `requestId: string`
- `userId: string`
- `authorName: string`
- `authorSubtitle: string`
- `whoAmI: string`
- `message: string`
- `estimate: string`

El sistema MUST responder `201` (preferido) o `200` con JSON:

- `id: string`
- `requestId: string`
- `userId: string`
- `author: { name: string, subtitle: string }`
- `whoAmI: string`
- `message: string`
- `estimate: string`
- `createdAt: string` (ISO-8601 datetime)
- `status: "SENT"`

#### Scenario: Create proposal returns persisted proposal
- **WHEN** el cliente envía `POST /proposals` con `requestId`, `userId` y `message`
- **THEN** el sistema responde `201` o `200` e incluye `id`, `requestId`, `userId`, `createdAt` y `status="SENT"`

### Requirement: Error response shape for 4xx
Para errores de validación o negocio, el sistema MUST responder con status `4xx` y body JSON:

- `{ "message": "Texto legible para usuario" }`

#### Scenario: Validation error uses message-only JSON
- **WHEN** el cliente envía un request inválido a un endpoint de `/proposals`
- **THEN** el sistema responde con `4xx` y body `{ "message": "<texto>" }`

