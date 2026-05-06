## Context

El flujo actual de propuestas depende de URLs externas para imágenes, lo que impide controlar autoría, ciclo de vida y reglas de acceso sobre los archivos. El cambio introduce carga directa de imágenes con reglas de negocio (mínimo 1, máximo 6), propiedad obligatoria por usuario autenticado y asociación con propuesta.

La solución debe iniciar con almacenamiento local en servidor, pero sin acoplarse al proveedor físico para permitir migración futura a S3, Azure Blob o GCS. El alcance impacta backend (API, validaciones, autorización, persistencia), frontend (envío multipart y gestión de adjuntos) y documentación OpenAPI.

Restricciones principales:
- No romper contratos públicos de lectura existentes.
- Mantener control de permisos para mutaciones sobre imágenes.
- Exponer URLs de visualización para consumidores autorizados.

## Goals / Non-Goals

**Goals:**
- Permitir carga de 1 a 6 imágenes por propuesta en creación y edición.
- Garantizar que cada imagen tenga `ownerUserId` y trazabilidad de propiedad.
- Asociar imágenes a propuestas y entregar URL de visualización en respuestas GET.
- Aplicar autorización para impedir que terceros modifiquen o eliminen imágenes ajenas.
- Introducir una abstracción de storage para desacoplar dominio y proveedor.
- Mantener una ruta de migración a cloud storage sin rediseño de lógica de negocio.

**Non-Goals:**
- Implementar migración a proveedor cloud en esta iteración.
- Diseñar CDN, transformaciones de imagen avanzadas o pipeline de optimización.
- Cambiar políticas de visibilidad funcional de propuestas fuera de lo ya definido.
- Resolver versionado de imágenes o historiales de cambios de archivo.

## Decisions

### 1) Separar dominio de archivos mediante `ImageStorageProvider`
**Decisión:** Definir un contrato de almacenamiento con operaciones mínimas (`save`, `delete`, `getPublicUrl` o equivalente) y usar una implementación local inicial (`LocalImageStorageProvider`).

**Rationale:** Evita acoplamiento del backend al filesystem y reduce costo de migración a cloud.

**Alternativas consideradas:**
- **Acoplar filesystem directo en servicio de propuestas:** descartado por alto costo de cambio futuro.
- **Integrar S3 desde el inicio:** descartado por dependencia externa aún no decidida.

### 2) Modelar imagen como entidad propia con ownership explícito
**Decisión:** Persistir imagen como registro propio con identificador, referencia a propietario (`ownerUserId`), metadatos mínimos y referencia opcional/obligatoria a propuesta según el flujo de guardado.

**Rationale:** Permite validación de permisos por recurso, auditoría y reglas de reutilización.

**Alternativas consideradas:**
- **Guardar solo array de URLs en propuesta:** descartado por ausencia de control de propiedad.
- **Guardar blobs en tabla de propuestas:** descartado por escalabilidad y mantenimiento.

### 3) Validación transaccional de reglas 1..6 imágenes por propuesta
**Decisión:** Validar límites en capa de aplicación al crear/editar propuesta, considerando estado final del conjunto de imágenes (actuales + nuevas - removidas).

**Rationale:** Evita estados inválidos y asegura consistencia de reglas de negocio.

**Alternativas consideradas:**
- **Validación solo en frontend:** descartado por falta de seguridad.
- **Validación exclusivamente por constraints de BD:** insuficiente para reglas combinadas.

### 4) Mutaciones de imagen restringidas por ownership
**Decisión:** Para reemplazo/eliminación/reasignación, verificar que el usuario autenticado sea propietario de la imagen; usuarios no propietarios solo pueden visualizar si tienen acceso a la propuesta.

**Rationale:** Cumple reglas de seguridad y evita manipulación entre usuarios.

**Alternativas consideradas:**
- **Permitir mutación por owner de propuesta sin owner de imagen:** descartado por romper regla explícita de propiedad de imagen.

### 5) Exposición de URLs a través de capa de API
**Decisión:** Los endpoints GET retornan URL de visualización proveniente del provider. Para almacenamiento local será ruta servida por backend; para cloud podrá ser URL directa o firmada sin cambiar contrato de dominio.

**Rationale:** Mantiene contrato estable y abstrae diferencias de proveedor.

## Risks / Trade-offs

- **[Riesgo] Crecimiento de almacenamiento local en disco** -> **Mitigación:** definir política de retención y job de limpieza para huérfanos.
- **[Riesgo] Inconsistencia entre DB y archivo físico en fallas parciales** -> **Mitigación:** manejo transaccional lógico con compensación (`delete`) en errores.
- **[Riesgo] URLs locales expuestas sin controles suficientes** -> **Mitigación:** servir archivos mediante endpoint con validación de acceso a propuesta cuando aplique.
- **[Trade-off] Mayor complejidad inicial por abstracción de storage** -> **Mitigación:** contrato pequeño y pruebas de contrato por provider.
- **[Trade-off] Más joins/consultas para resolver imágenes y ownership** -> **Mitigación:** índices por `proposalId` y `ownerUserId`, y selección de campos mínima.

## Migration Plan

1. Introducir entidad/tabla de imágenes y relaciones con propuesta/usuario.
2. Implementar `ImageStorageProvider` y provider local.
3. Ajustar endpoints de creación/edición para aceptar archivos y aplicar reglas 1..6.
4. Ajustar endpoints de lectura para devolver URLs de imágenes.
5. Actualizar OpenAPI/Swagger y tests automatizados.
6. Desplegar con feature toggles si el entorno lo requiere.
7. Rollback: desactivar nueva ruta de upload y mantener creación por URL temporalmente si existe fallback operativo.

## Open Questions

- ¿Se permitirá reutilizar una imagen del mismo propietario en múltiples propuestas o se forzará relación 1:1 imagen-propuesta?
- ¿Las URLs devueltas deben ser persistentes o con expiración (signed URL) desde esta fase?
- ¿Se requiere validación de tipo/tamaño por archivo (MIME, MB máximos) con límites específicos por negocio?
- ¿Qué estrategia de limpieza se aplicará para archivos subidos y no asociados por fallas/cancelaciones?

## Implementation Notes (Resolved)

- **Multipart parsing compatibility**: se ajustó la transformación de DTO para aceptar `tags` en formatos comunes de formulario (array, JSON string o CSV) y `images` como array JSON, objeto único JSON o campo vacío.
- **Optional `images` with file uploads**: el endpoint permite omitir `images` cuando se envían archivos en `files`; la regla 1..6 se valida sobre el conjunto final (imágenes de body + archivos subidos).
- **Multer memory handling**: se configuró `FilesInterceptor` con `memoryStorage()` para garantizar disponibilidad de `file.buffer` en create/patch.
- **TypeORM join mapping fix**: se definió `@JoinColumn({ name: 'open_request_id' })` en `OpenRequestImageEntity` para alinear el mapeo ORM con el esquema físico en snake_case y evitar errores de consulta por columna inexistente.
- **Compensation behavior**: se confirmó eliminación compensatoria de archivos recién subidos cuando falla validación o persistencia durante create/update.
