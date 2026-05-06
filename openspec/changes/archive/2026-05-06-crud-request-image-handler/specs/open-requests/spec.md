## MODIFIED Requirements

### Requirement: Create open request (authenticated)

El sistema MUST exponer `POST /open-requests` protegido por autenticación Bearer y MUST validar el cuerpo de entrada para campos mutables de propuesta, incluyendo imágenes cargadas desde la aplicación.

La creación MUST exigir entre 1 y 6 imágenes asociadas a la propuesta al finalizar la operación.

Cada imagen recibida MUST quedar asociada al usuario autenticado que ejecuta la creación y persistida con referencia a la propuesta creada.

El sistema MUST responder `201` con un JSON que incluya al menos `id` y los campos necesarios para reconstruir o enlazar el detalle (`GET /open-requests/{id}`), incluyendo URLs de imágenes para visualización.

#### Scenario: Authenticated client creates an open request with valid image count
- **WHEN** un cliente autenticado con permiso de creación envía `POST /open-requests` con datos válidos y entre 1 y 6 imágenes
- **THEN** el sistema responde `201`, crea la propuesta y asocia las imágenes al usuario autenticado con URLs de visualización disponibles

#### Scenario: Create request fails when no images are provided
- **WHEN** un cliente autenticado envía `POST /open-requests` sin imágenes
- **THEN** el sistema responde error de validación y no crea la propuesta

#### Scenario: Create request fails when image count exceeds six
- **WHEN** un cliente autenticado envía `POST /open-requests` con más de 6 imágenes
- **THEN** el sistema responde error de validación y no crea la propuesta

### Requirement: Update open request by id (authenticated)

El sistema MUST exponer `PATCH /open-requests/{id}` protegido por autenticación Bearer y MUST aplicar solo los campos permitidos del body (actualización parcial), incluyendo cambios en el set de imágenes.

Al finalizar una edición, la propuesta MUST conservar entre 1 y 6 imágenes válidas.

Para operaciones sobre imágenes existentes (reemplazo/eliminación/reutilización), el backend MUST validar que el usuario autenticado sea propietario de cada imagen afectada.

El sistema MUST responder `200` con el recurso actualizado en forma compatible con el detalle existente, incluyendo URLs de imágenes resultantes.

El sistema MUST responder `404` con `{ "message": "..." }` cuando el id no exista o no sea visible según las reglas de publicación/borrado lógico.

#### Scenario: Owner updates request and keeps valid image range
- **WHEN** el titular autorizado envía `PATCH /open-requests/{id}` con cambios válidos y el resultado mantiene entre 1 y 6 imágenes
- **THEN** el sistema responde `200` y la persistencia refleja los cambios

#### Scenario: Unauthorized user cannot mutate another user's image
- **WHEN** un usuario autenticado intenta remover o reemplazar una imagen cuyo propietario es otro usuario
- **THEN** el sistema responde error de autorización y mantiene intactas las imágenes no autorizadas

### Requirement: Validation and error contract for write operations

Para errores de validación en escritura, el sistema MUST responder `400` con el contrato global de errores del API (incluyendo `status`, `errorCode`, `message`, `technicalMessage`, `correlationId`, `timestamp`, y `details` cuando aplique).

Las operaciones de creación y edición de propuestas MUST validar reglas de cantidad de imágenes (mínimo 1, máximo 6) y propiedad para mutaciones.

Los objetos anidados de escritura MUST validarse con reglas explícitas por campo, de modo que propiedades esperadas no sean tratadas como no permitidas bajo `whitelist` + `forbidNonWhitelisted`.

#### Scenario: Invalid image count returns 400
- **WHEN** el cliente envía una creación o edición que deja la propuesta con 0 imágenes o más de 6
- **THEN** el sistema responde `400` con detalle de validación de cantidad de imágenes

#### Scenario: Ownership violation returns authorization error
- **WHEN** el cliente intenta mutar una imagen sin ser su propietario
- **THEN** el sistema responde error de autorización según el contrato de seguridad del API

## ADDED Requirements

### Requirement: Open request detail exposes image URLs for authorized viewers
El sistema MUST incluir en `GET /open-requests/{id}` la lista de imágenes asociadas con la URL necesaria para visualización.

Los usuarios con permiso para ver la propuesta MUST poder recibir esas URLs aunque no sean propietarios de las imágenes.

#### Scenario: Detail endpoint returns image URLs
- **WHEN** un cliente autorizado consulta `GET /open-requests/{id}` para una propuesta con imágenes
- **THEN** la respuesta incluye la colección de imágenes con su URL de visualización
