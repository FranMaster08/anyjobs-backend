## Why

La sub-API de solicitudes abiertas (`/open-requests`) hoy solo permite **consulta pública** (listado paginado y detalle). Sin operaciones de escritura no hay forma soportada en API de **crear, actualizar o eliminar** solicitudes desde flujos autenticados (cliente u operación interna), lo que frena publicación y mantenimiento desde el producto.

## What Changes

- Exponer operaciones **CRUD de escritura** bajo el mismo base path `/open-requests`: creación (`POST`), actualización parcial (`PATCH` por id) y baja (`DELETE` por id), con cuerpos y validación acordes al modelo existente de detalle/listado.
- Añadir **autenticación y autorización** (p. ej. permisos RBAC y/o propiedad del recurso) para que el listado/detalle públicos no se vean comprometidos.
- Extender **persistencia** (TypeORM), **casos de uso** y **contratos** (OpenAPI/Swagger, DTOs) en `anyjobs-back`.
- Asegurar que en Swagger/OpenAPI las operaciones protegidas de escritura queden marcadas con seguridad Bearer (candado visible) mientras los `GET` públicos se mantienen sin candado.
- Endurecer/alinear validación de payloads anidados (`images`, `provider`, `providerReviews`) para convivir con `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted`) y evitar rechazos falsos por propiedades válidas.
- Documentar el contrato en **OpenSpec** como delta sobre la capacidad `open-requests` (requisitos **ADDED**; sin cambiar el comportamiento normativo de los `GET` existentes salvo que el diseño lo exija explícitamente).

## Capabilities

### New Capabilities

<!-- Ninguna: la escritura se modela como extensión de la capacidad existente `open-requests`. -->

### Modified Capabilities

- `open-requests`: incorporar requisitos de API para crear, actualizar y eliminar solicitudes abiertas, con errores y seguridad alineados al MVP.

## Impact

- **Backend (`anyjobs-back`)**: módulo `open-requests` (controlador, use cases, puerto de repositorio, adaptador TypeORM, entidad si hace falta p. ej. `ownerId` o estado).
- **Swagger/OpenAPI**: decorators de seguridad por operación para reflejar correctamente qué rutas requieren autenticación.
- **Especificación**: delta en `openspec/changes/crud-requests/specs/open-requests/spec.md`; tras implementación, propagar a `anyjobs-back/openspec/specs/open-requests/spec.md` según el flujo del repo.
- **Frontend (`anyjobs-front`)**: opcional en esta change; puede quedar solo API lista para integración posterior.
