## Why

Necesitamos una base consistente y reusable para el backend AnyJobs: un monorepo NestJS con DDD por módulos y “cross-cutting concerns” obligatorios (config por env, logging trazable, contrato de errores, seguridad deny-by-default, Swagger y testing) para poder construir features sin retrabajo.

## What Changes

- Se crea el scaffold del proyecto NestJS en modo monorepo con `apps/api` como aplicación principal.
- Se establece la estructura DDD estricta por módulo bajo `apps/api/src/modules/<module>/{domain,application,infrastructure,api}`.
- Se incorpora configuración centralizada por variables de entorno con validación fail-fast y `.env.example`.
- Se incorpora una base de paginación reutilizable para búsquedas/listados (tipos `PageRequest`/`PageResult` y límites por env) para asegurar que ningún endpoint liste “todo” sin paginar.
- Se incorpora Correlation ID por request y logging consistente con NestJS Logger (sin `console.log`) con niveles configurables por env y redacción de payloads.
- Se incorpora un manejo de errores global con contrato único hacia el cliente basado en un catálogo de `errorCode`, y logging técnico completo con `correlationId`.
- Se incorpora RBAC con política **DENY ALL** por defecto (todo endpoint requiere auth + autorización explícita, salvo excepciones declaradas).
- Se incorpora base de Swagger desacoplada del controller (estructura por módulo).
- Se incorpora base de testing (unit + e2e) lista para crecer con endpoints futuros.

## Capabilities

### New Capabilities

- `nestjs-monorepo-base`: Scaffold del monorepo NestJS y estructura inicial `apps/api` + layout de módulos DDD.
- `config-by-env`: ConfigModule global, mapeo tipado de envs, validación fail-fast, `.env.example`.
- `pagination-foundation`: Contrato y helpers para paginación obligatoria (`items` + `meta`) con validación de `page/pageSize` y máximo configurable por env.
- `request-correlation-id`: Disponibilidad y propagación de `correlationId` para requests, logs y respuestas.
- `structured-logging`: Logging con NestJS Logger (niveles), redacción/sanitización de payloads y configuración por env.
- `global-error-contract`: Exception handler global con catálogo de errores y contrato único de error para el cliente.
- `rbac-deny-by-default`: Guard global de auth+RBAC con denegación por defecto y decoradores de metadata para permisos/roles.
- `swagger-foundation`: Convención/estructura de Swagger por módulo con decoradores “composite” fuera del controller.
- `testing-foundation`: Setup base de unit tests y e2e tests (Jest + TestingModule + Supertest) para nuevos endpoints.

### Modified Capabilities

<!-- None (no hay specs existentes en openspec/specs/ que modificar) -->

## Impact

- **Código**: Se crean estructuras y módulos base bajo `apps/api/src/*` y convenciones de carpeta por módulo.
- **API**: Se definen contratos transversales (errores, auth/RBAC, headers como correlation id) que aplicarán a todos los endpoints nuevos.
- **Dependencias**: Se agregan dependencias típicas de NestJS monorepo, validación de envs, Swagger y testing.
- **Operación**: Se definen variables de entorno requeridas y comportamiento fail-fast al boot.
