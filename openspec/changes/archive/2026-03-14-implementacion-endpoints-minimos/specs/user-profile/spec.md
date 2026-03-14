## ADDED Requirements

### Requirement: Users API base path
El sistema MUST exponer la sub-API de usuarios bajo el base path `/users`.

#### Scenario: Users API is reachable under /users
- **WHEN** el cliente construye la URL de la API de users como `<host>/users`
- **THEN** las rutas definidas en este spec responden bajo ese prefijo

### Requirement: All profile routes are under /users/me
El sistema MUST exponer las rutas de perfil del usuario actual bajo `/users/me/*`.

#### Scenario: Profile routes exist under /users/me
- **WHEN** el cliente invoca rutas de perfil
- **THEN** el path comienza con `/users/me/`

### Requirement: Update location
El sistema MUST aceptar `PATCH /users/me/location` con body JSON:

- `city: string` (requerido)
- `area?: string`
- `countryCode?: string`
- `coverageRadiusKm?: number`

El sistema MUST responder `204 No Content` si el request es válido.

#### Scenario: Update location succeeds
- **WHEN** el usuario autenticado envía `PATCH /users/me/location` con `city` y opcionalmente `area`, `countryCode`, `coverageRadiusKm`
- **THEN** el sistema responde `204`

### Requirement: Update worker profile
El sistema MUST aceptar `PATCH /users/me/worker-profile` con body JSON:

- `categories: string[]`
- `headline?: string`
- `bio?: string`

Si el usuario tiene rol `"WORKER"`, `categories` MUST tener al menos 1 elemento.

El sistema MUST responder `204 No Content` si el request es válido.

#### Scenario: Worker profile accepts missing headline and bio
- **WHEN** un usuario con rol `"WORKER"` envía `PATCH /users/me/worker-profile` con `categories` y omite `headline` y `bio`
- **THEN** el sistema responde `204`

### Requirement: Update client profile
El sistema MUST aceptar `PATCH /users/me/client-profile` con body JSON:

- `preferredPaymentMethod: "CARD" | "TRANSFER" | "CASH" | "WALLET"`

El sistema MUST responder `204 No Content` si el request es válido.

#### Scenario: Client profile update succeeds
- **WHEN** el usuario autenticado envía `PATCH /users/me/client-profile` con un `preferredPaymentMethod` válido
- **THEN** el sistema responde `204`

### Requirement: Update personal info
El sistema MUST aceptar `PATCH /users/me/personal-info` con body JSON:

- `documentType: "DNI" | "NIE" | "PASSPORT"`
- `documentNumber: string`
- `birthDate: string` (formato `YYYY-MM-DD`)
- `gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"`
- `nationality?: string`

Si el usuario tiene rol `"WORKER"`, `documentType`, `documentNumber` y `birthDate` MUST estar presentes.

El sistema MUST responder `204 No Content` si el request es válido.

#### Scenario: Personal info update succeeds
- **WHEN** el usuario autenticado envía `PATCH /users/me/personal-info` con campos válidos
- **THEN** el sistema responde `204`

### Requirement: Error response shape for 4xx
Para errores de validación o negocio, el sistema MUST responder con status `4xx` y body JSON:

- `{ "message": "Texto legible para usuario" }`

#### Scenario: Validation error uses message-only JSON
- **WHEN** el cliente envía un request inválido a un endpoint de `/users`
- **THEN** el sistema responde con `4xx` y body `{ "message": "<texto>" }`

