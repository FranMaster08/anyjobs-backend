## ADDED Requirements

### Requirement: Create open request (authenticated)

El sistema MUST exponer `POST /open-requests` protegido por autenticación Bearer y MUST validar el cuerpo JSON según el contrato acordado para campos mutables (p. ej. título, descripción, etiquetas, etiquetas de ubicación y presupuesto, contacto, imágenes).

El sistema MUST responder `201` con un JSON que incluya al menos `id` y los campos necesarios para reconstruir o enlazar el detalle (`GET /open-requests/{id}`), o `200` si el stack ya estandariza otro código, siempre documentado de forma consistente.

#### Scenario: Authenticated client creates an open request

- **WHEN** un cliente autenticado con permiso de creación envía `POST /open-requests` con un body válido
- **THEN** el sistema responde `201` (o el código acordado) y el body incluye el `id` del recurso creado

#### Scenario: Unauthenticated create is rejected

- **WHEN** un cliente sin token válido llama `POST /open-requests`
- **THEN** el sistema responde `401` o `403` según el modelo de seguridad del API

### Requirement: Update open request by id (authenticated)

El sistema MUST exponer `PATCH /open-requests/{id}` protegido por autenticación Bearer y MUST aplicar solo los campos permitidos del body (actualización parcial).

El sistema MUST responder `200` con el recurso actualizado en forma compatible con el detalle existente, o `204` si el diseño elige respuesta vacía, documentado de forma consistente.

El sistema MUST responder `404` con `{ "message": "..." }` cuando el id no exista o no sea visible según las reglas de publicación/borrado lógico.

#### Scenario: Owner updates their open request

- **WHEN** el titular autorizado envía `PATCH /open-requests/{id}` con cambios válidos
- **THEN** el sistema responde `200` (o `204` si aplica) y la persistencia refleja los cambios

#### Scenario: Unauthorized user cannot update another user's request

- **WHEN** un usuario autenticado sin permiso sobre `{id}` envía `PATCH /open-requests/{id}`
- **THEN** el sistema responde `403` (o `404` si se aplica ocultación por política)

### Requirement: Delete open request by id (authenticated)

El sistema MUST exponer `DELETE /open-requests/{id}` protegido por autenticación Bearer.

El sistema MUST definir si la baja es física o lógica; en ambos casos MUST documentar el efecto sobre `GET /open-requests/{id}` y el listado público.

El sistema MUST responder `404` con `{ "message": "..." }` cuando el id no exista o ya esté dado de baja según las reglas acordadas.

#### Scenario: Authorized delete succeeds

- **WHEN** un titular autorizado llama `DELETE /open-requests/{id}` para un recurso existente
- **THEN** el sistema responde `204` o `200` según el contrato elegido y el recurso deja de estar disponible según la semántica de baja

#### Scenario: Delete forbidden without permission

- **WHEN** un usuario sin permiso sobre `{id}` llama `DELETE /open-requests/{id}`
- **THEN** el sistema responde `403` (o `404` si aplica ocultación)

### Requirement: Validation and error contract for write operations

Para errores de validación en escritura, el sistema MUST responder `400` con el contrato global de errores del API (incluyendo `status`, `errorCode`, `message`, `technicalMessage`, `correlationId`, `timestamp`, y `details` cuando aplique).

Los objetos anidados de escritura (`images`, `provider`, `providerReviews`) MUST validarse con reglas explícitas por campo, de modo que propiedades esperadas no sean tratadas como no permitidas bajo `whitelist` + `forbidNonWhitelisted`.

#### Scenario: Invalid create payload returns 400 with message

- **WHEN** el cliente envía `POST /open-requests` con datos inválidos (campos requeridos ausentes o tipos incorrectos)
- **THEN** el sistema responde `400` con `errorCode = "VALIDATION.INVALID_INPUT"` y `details` de validación

### Requirement: Swagger marks protected write endpoints with bearer security

La documentación OpenAPI MUST marcar `POST /open-requests`, `PATCH /open-requests/{id}` y `DELETE /open-requests/{id}` como operaciones con seguridad Bearer.

Los endpoints públicos de lectura (`GET /open-requests`, `GET /open-requests/{id}`) MUST mantenerse sin requerimiento de seguridad en la documentación.

#### Scenario: Swagger shows lock for write operations only

- **WHEN** un desarrollador abre Swagger UI para la API de open requests
- **THEN** las operaciones de escritura muestran candado y las operaciones GET públicas no
