## ADDED Requirements

### Requirement: Auth API base path
El sistema MUST exponer la sub-API de autenticación bajo el base path `/auth`.

#### Scenario: Auth API is reachable under /auth
- **WHEN** el cliente construye la URL de la API de auth como `<host>/auth`
- **THEN** las rutas definidas en este spec responden bajo ese prefijo

### Requirement: Register creates pending user and returns next stage
El sistema MUST aceptar `POST /auth/register` con el body JSON:

- `fullName: string`
- `email: string`
- `phoneNumber: string`
- `password: string`
- `roles: ("CLIENT" | "WORKER")[]` (min 1)

El sistema MUST responder `200` con JSON que incluya:

- `userId: string`
- `status: "PENDING"`
- `emailVerificationRequired: boolean`
- `phoneVerificationRequired: boolean`
- `nextStage: "VERIFY"`

#### Scenario: Successful register returns pending status and next stage
- **WHEN** el cliente envía `POST /auth/register` con un payload válido
- **THEN** el sistema responde `200` y el body contiene `userId`, `status="PENDING"` y `nextStage="VERIFY"`

### Requirement: Email availability
El sistema MUST exponer `GET /auth/email-available?email=<email>` y responder `200` con JSON:

- `available: boolean`

#### Scenario: Email availability returns true for unused email
- **WHEN** el cliente llama `GET /auth/email-available?email=<email-no-usado>`
- **THEN** el sistema responde `200` con `{ "available": true }`

### Requirement: Phone availability
El sistema MUST exponer `GET /auth/phone-available?phoneNumber=<e164>` y responder `200` con JSON:

- `available: boolean`

#### Scenario: Phone availability returns true for unused phone number
- **WHEN** el cliente llama `GET /auth/phone-available?phoneNumber=<phone-no-usado>`
- **THEN** el sistema responde `200` con `{ "available": true }`

### Requirement: Verify email with OTP without userId in request
El sistema MUST aceptar `POST /auth/verify-email` con body JSON:

- `otpCode: string`

El sistema MUST permitir esta verificación **sin** requerir `userId` en el request.

El sistema MUST responder `204 No Content` (preferido) o `200` con body vacío.

#### Scenario: Verify email succeeds with otpCode only
- **WHEN** el cliente envía `POST /auth/verify-email` con `{ "otpCode": "<code>" }` y existe un flow de registro válido asociado
- **THEN** el sistema responde `204` (o `200` vacío) y la verificación queda aplicada al usuario del flow

### Requirement: Verify phone with OTP without userId in request
El sistema MUST aceptar `POST /auth/verify-phone` con body JSON:

- `otpCode: string`

El sistema MUST permitir esta verificación **sin** requerir `userId` en el request.

El sistema MUST responder `204 No Content` (preferido) o `200` con body vacío.

#### Scenario: Verify phone succeeds with otpCode only
- **WHEN** el cliente envía `POST /auth/verify-phone` con `{ "otpCode": "<code>" }` y existe un flow de registro válido asociado
- **THEN** el sistema responde `204` (o `200` vacío) y la verificación queda aplicada al usuario del flow

### Requirement: Login returns token and user snapshot
El sistema MUST aceptar `POST /auth/login` con body JSON:

- `email: string`
- `password: string`

El sistema MUST responder `200` con JSON:

- `token: string`
- `user: object` que MUST incluir al menos:
  - `id: string`
  - `fullName: string`
  - `email: string`
  - `roles: ("CLIENT" | "WORKER")[]`

El sistema MAY incluir campos opcionales adicionales en `user` sin romper compatibilidad con el front.

#### Scenario: Successful login returns token and required user fields
- **WHEN** el cliente envía `POST /auth/login` con credenciales válidas de un usuario activo
- **THEN** el sistema responde `200` con `token` y `user.id`, `user.fullName`, `user.email`, `user.roles`

### Requirement: Error response shape for 4xx
Para errores de validación o negocio, el sistema MUST responder con status `4xx` y body JSON:

- `{ "message": "Texto legible para usuario" }`

#### Scenario: Validation error uses message-only JSON
- **WHEN** el cliente envía un request inválido (p.ej. email con formato inválido) a un endpoint de `/auth`
- **THEN** el sistema responde con `4xx` y body `{ "message": "<texto>" }`

