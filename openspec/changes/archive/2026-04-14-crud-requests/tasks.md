## 1. Contrato y especificación

- [x] 1.1 Revisar `anyjobs-back/openspec/specs/open-requests/spec.md` y fusionar los requisitos ADDED de `openspec/changes/crud-requests/specs/open-requests/spec.md` cuando la change se archive o según el flujo del equipo.
- [x] 1.2 Actualizar documentación de API del backend (p. ej. `README` o Swagger decorators) con `POST`, `PATCH` y `DELETE` bajo `/open-requests`.

## 2. Dominio y persistencia

- [x] 2.1 Extender el puerto `OpenRequestsRepositoryPort` y el adaptador TypeORM con `create`, `updatePartial` y `delete` (o borrado lógico), incluyendo migración si se añaden columnas (`ownerId`, `deletedAt`, estado, etc.).
- [x] 2.2 Alinear la entidad `OpenRequestEntity` con los campos necesarios para autoría y ciclo de vida acordados en `design.md`.

## 3. API HTTP (NestJS)

- [x] 3.1 Implementar DTOs de entrada/salida y validación (class-validator) para create y patch.
- [x] 3.2 Añadir casos de uso `CreateOpenRequest`, `UpdateOpenRequest`, `DeleteOpenRequest` y cablearlos en `OpenRequestsController` con guards de auth y permisos.
- [x] 3.3 Registrar Swagger/OpenAPI para las nuevas rutas.

## 4. Datos de prueba y calidad

- [x] 4.1 Actualizar seed o repositorio en memoria (si aplica) para soportar las nuevas operaciones en desarrollo local.
- [x] 4.2 Añadir pruebas (unitarias o e2e) que cubran happy path y 401/403/404 en las rutas de escritura.

## 5. Frontend (opcional / fase posterior)

- [ ] 5.1 Integrar formularios o pantallas en `anyjobs-front` que consuman el CRUD cuando el producto lo requiera.
