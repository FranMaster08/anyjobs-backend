## Context

El backend ya expone `GET /open-requests` y `GET /open-requests/:id` sin autenticación, con entidad `OpenRequestEntity` y repositorio que solo implementa `list` y `getById`. El contrato de detalle incluye campos enriquecidos (`provider`, `reputation`, `images`, etc.) que hoy vienen de seed/datos de demo. Cualquier CRUD debe decidir qué campos son **entrada del cliente** frente a **derivados o de sistema**.

## Goals / Non-Goals

**Goals:**

- Definir endpoints REST autenticados para **crear**, **actualizar** y **eliminar** solicitudes abiertas, con respuestas coherentes con los DTOs existentes de detalle o listado donde aplique.
- Integrar con el **modelo de permisos** actual del API (Bearer + RBAC) y evitar que un usuario modifique recursos ajenos salvo rol explícito (p. ej. admin), si el producto lo requiere.
- Mantener los **GET públicos** como están salvo decisión explícita (p. ej. ocultar borradores en listado).

**Non-Goals:**

- Rediseñar el modelo completo de “proveedor” y reseñas en esta change (se puede seguir generando o fijando valores por defecto en create/update).
- Implementar en esta change toda la UI de alta/edición en Angular (puede ser fase posterior).
- Versionar la API bajo `/v2` salvo que se acuerde **BREAKING** explícito.

## Decisions

### 1) Forma de los endpoints

- **Decisión**: `POST /open-requests`, `PATCH /open-requests/:id`, `DELETE /open-requests/:id`, todos bajo el mismo prefijo que los GET.
- **Rationale**: coherencia con el spec actual y menor superficie para clientes.
- **Alternativas**: sub-recurso `/admin/open-requests` (más claro para roles admin-only); rechazable si el producto quiere que el cliente autenticado gestione sus propias solicitudes bajo el mismo path.

### 2) PATCH semántica y payload

- **Decisión**: actualización **parcial** con DTO que permita solo campos mutables (título, descripción, etiquetas, presupuesto, ubicación, imágenes, contacto, etc.), no ids generados por el servidor en el body de create.
- **Rationale**: alinea con prácticas REST y reduce riesgo de sobrescritura accidental de metadatos.
- **Alternativas**: `PUT` sustitutivo completo (más rígido para clientes).

### 3) DELETE: físico vs lógico

- **Decisión**: preferir **borrado lógico** (p. ej. columna `deletedAt` o `status`) si el dominio necesita auditoría o enlaces históricos con `proposals`; si el MVP acepta pérdida dura, **DELETE físico** documentado.
- **Rationale**: las propuestas referencian `requestId`; un DELETE físico puede romper integridad referencial si no hay política en cascada.
- **Alternativas**: solo “cerrar” solicitud sin eliminar fila.

### 4) Autorización

- **Decisión**: en MVP, **solo el propietario** (o rol con permiso dedicado p. ej. `open-requests.manage`) puede PATCH/DELETE; lectura pública se mantiene para registros “publicados”. Detallar `ownerId` o equivalente en entidad y JWT.
- **Rationale**: mínimo viable seguro sin exponer escritura anónima.
- **Alternativas**: admin global único; multi-tenant más adelante.

### 5) Coherencia listado vs detalle tras mutación

- **Decisión**: tras create, responder **201** con cuerpo tipo detalle o con `id` + ubicación; listado público solo incluye solicitudes en estado publicado (si se introduce estado).
- **Rationale**: evita que un borrador aparezca en el feed público sin querer.

### 6) Seguridad visible en Swagger

- **Decisión**: marcar explícitamente en OpenAPI las operaciones protegidas (`POST`, `PATCH`, `DELETE`) con esquema Bearer para que Swagger UI muestre candado solo en esas rutas.
- **Rationale**: evita confusión operativa en QA/desarrollo y alinea documentación ejecutable con comportamiento real del guard.
- **Alternativas**: confiar solo en descripciones de texto sin metadata de seguridad por endpoint; rechazado por mala UX en pruebas manuales.

### 7) DTOs anidados y ValidationPipe estricto

- **Decisión**: los DTOs anidados de escritura (`ImageDto`, `ProviderDto`, `ProviderReviewDto`) deben declarar validadores de `class-validator` en sus propiedades.
- **Rationale**: con `whitelist=true` y `forbidNonWhitelisted=true`, `@ApiProperty` no es suficiente; sin validadores, campos válidos se rechazan como “should not exist”.
- **Alternativas**: relajar `ValidationPipe`; rechazado por pérdida de hardening global.

## Risks / Trade-offs

- **[Riesgo] Modelo de datos demo vs producción** → Mitigación: documentar qué campos son obligatorios en POST y valores por defecto para `provider`/`reviews` en MVP.
- **[Riesgo] Rotura de integridad con `proposals`** → Mitigación: borrado lógico o restricción “no DELETE si hay propuestas”.
- **[Trade-off] Complejidad de permisos** → Empezar con regla simple propietario+permiso; ampliar roles después.
- **[Riesgo] Divergencia entre seguridad real y documentación Swagger** → Mitigación: exigir `ApiBearerAuth` en cada operación protegida.
- **[Riesgo] Rechazos 400 inesperados por nested DTOs** → Mitigación: validar propiedades anidadas explícitamente y cubrir con e2e.

## Migration Plan

- Añadir migración/columnas si hay borrado lógico u `ownerId`.
- Desplegar API antes o junto con front; GET sin cambios reduce riesgo.
- Rollback: revertir rutas de escritura y migración si aplica.

## Open Questions

- ¿Quién es el “propietario” en el dominio (usuario cliente del JWT, organización)?
- ¿Las solicitudes en borrador deben aparecer en algún listado autenticado separado del público?
- ¿DELETE permitido cuando existen propuestas `SENT`?
