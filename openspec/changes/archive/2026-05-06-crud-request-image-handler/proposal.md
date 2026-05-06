## Why

Actualmente, al crear propuestas el sistema solo acepta URLs externas de imágenes, lo que impide una carga directa desde la aplicación y deja sin control la propiedad del recurso. Este cambio es necesario ahora para garantizar trazabilidad de autoría, reglas de acceso y una base técnica preparada para migrar a almacenamiento cloud sin romper contratos funcionales.

## What Changes

- Habilitar carga directa de imágenes desde la aplicación durante creación y edición de propuestas.
- Definir validaciones de negocio para propuestas con mínimo 1 y máximo 6 imágenes.
- Persistir cada imagen con relación obligatoria al usuario autenticado que la sube (propietario).
- Asociar imágenes a propuestas y devolver URL de visualización en endpoints de consulta.
- Restringir operaciones de actualización/eliminación/reemplazo/reutilización de imágenes a su propietario, validando permisos en backend.
- Eliminar la dependencia funcional de URLs externas como mecanismo principal de imágenes.
- Introducir una abstracción de almacenamiento (por ejemplo `ImageStorageProvider`) para desacoplar lógica de negocio del proveedor físico.
- Implementar almacenamiento inicial en servidor local manteniendo compatibilidad futura con S3/Azure Blob/GCS u otro proveedor.
- Actualizar documentación Swagger/OpenAPI de los endpoints afectados.

## Capabilities

### New Capabilities
- `request-image-storage`: Gestiona carga, almacenamiento y resolución de URL de imágenes mediante un contrato desacoplado de proveedor.
- `request-image-ownership`: Define propiedad de imagen por usuario autenticado y reglas de autorización para mutaciones.

### Modified Capabilities
- `open-requests`: Cambia creación, edición y consulta de propuestas para incorporar carga de archivos, límites de cantidad (1..6) y exposición de URLs de imágenes asociadas.

## Impact

- **Backend API**: cambios en endpoints de creación/edición/consulta de propuestas y en contratos request/response para soportar archivos e incluir URLs de imágenes.
- **Persistencia**: nuevo/ajustado modelo de datos para imágenes con relación a propuesta y usuario propietario.
- **Autorización**: nuevas validaciones de propiedad y permisos antes de permitir operaciones de actualización o eliminación.
- **Storage**: incorporación de interfaz de almacenamiento + implementación local inicial y puntos de extensión para proveedores cloud.
- **Documentación**: actualización de Swagger/OpenAPI para reflejar multipart/form-data, respuestas y reglas de negocio.
