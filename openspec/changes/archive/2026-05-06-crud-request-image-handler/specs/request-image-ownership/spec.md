## ADDED Requirements

### Requirement: Every uploaded image has an authenticated owner
El sistema MUST registrar el usuario autenticado como propietario de cada imagen cargada.

Una imagen MUST NOT existir como recurso anónimo sin relación de propiedad.

#### Scenario: Upload stores owner user id
- **WHEN** un usuario autenticado carga una imagen para una propuesta
- **THEN** el registro de imagen persiste `ownerUserId` con el identificador del usuario autenticado

### Requirement: Non-owners cannot mutate foreign images
El sistema MUST validar ownership antes de permitir actualizar, reemplazar, eliminar o reutilizar una imagen.

Si el usuario autenticado no es propietario, el sistema MUST rechazar la mutación con error de autorización consistente con la política del API.

#### Scenario: Unauthorized user attempts to delete foreign image
- **WHEN** un usuario no propietario intenta eliminar una imagen de otro usuario
- **THEN** el sistema rechaza la operación con error de autorización sin modificar el recurso

### Requirement: Authorized users can view images through request access rules
El sistema MUST permitir visualización de imágenes a usuarios autorizados a ver la propuesta asociada, incluso si no son propietarios de la imagen.

La autorización de lectura MUST seguir las reglas funcionales de visibilidad de propuestas.

#### Scenario: Reviewer can see image of visible request
- **WHEN** un usuario con acceso de lectura a una propuesta consulta su detalle
- **THEN** el sistema devuelve las URLs de imágenes asociadas aunque el usuario no sea su propietario
