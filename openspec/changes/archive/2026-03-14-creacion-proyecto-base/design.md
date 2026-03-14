## Context

Este cambio crea el “proyecto base” para el backend AnyJobs como monorepo NestJS con `apps/api` y una arquitectura DDD estricta por módulo. El objetivo es que toda implementación posterior (endpoints y casos de uso) nazca dentro de una estructura consistente y con concerns transversales obligatorios ya resueltos:

- Configuración por variables de entorno (sin `process.env` fuera del módulo de config), validación fail-fast y `.env.example`.
- Logging consistente con NestJS Logger, con Correlation ID por request y redacción de datos sensibles.
- Manejo de errores global con contrato único al cliente + logging técnico completo.
- Seguridad por defecto (**DENY ALL**) con autenticación + autorización (RBAC) como guard global.
- Swagger desacoplado de controllers (decoradores “composite” por endpoint en carpeta `api/swagger/`).
- Base de testing (unit + e2e) lista para crecer.

Restricciones relevantes (reglas del repo):
- Prohibido exponer listados/búsquedas sin paginación y metadata completa.
- Prohibido usar `console.log`.
- Prohibido hardcodear configuración variable; todo por env y validado.
- Prohibido devolver stack traces/detalles técnicos al cliente; contrato único con `errorCode`.
- Prohibido exponer endpoints sin RBAC explícito; policy base deny-by-default.

## Goals / Non-Goals

**Goals:**
- Crear el scaffold NestJS monorepo con `apps/api/src/{main.ts,app.module.ts}`.
- Definir convenciones de carpetas por módulo (DDD) en `apps/api/src/modules/<module>/` con `domain/`, `application/`, `infrastructure/`, `api/`.
- Implementar “foundations” transversales:
  - Config global por env con validación (fail-fast) y `.env.example`.
  - Middleware/interceptor de Correlation ID que:
    - acepte `x-correlation-id` entrante (si viene),
    - genere uno si no viene,
    - lo exponga a logs y respuesta (y/o header de salida) sin romper el contrato.
  - Logger consistente (NestJS Logger) con:
    - niveles por env (`LOG_LEVEL`) y toggle de payloads (`LOG_DEBUG_PAYLOADS`),
    - sanitización/redacción (authorization, cookies, tokens, passwords, api keys, etc.).
  - Global Exception Filter que:
    - mapee errores a un catálogo central de `errorCode`,
    - construya la respuesta estándar de error con `correlationId`,
    - loguee el error técnico completo con stack trace.
  - Guard global de auth+RBAC con deny-by-default:
    - si el endpoint no declara permisos/roles requeridos → 403 (o 401 según estado de auth), nunca permitir “por defecto”.
    - soporte a un decorador explícito `@Public()` solo para excepciones justificadas (ej. health) y documentadas.
  - Base de Swagger por módulo (decoradores “composite” en `api/swagger/`).
  - Setup de tests:
    - unit tests para casos de uso (mockeando puertos),
    - e2e con `supertest` sobre Nest app en modo test.

**Non-Goals:**
- No implementar lógica de negocio del MVP ni endpoints funcionales “reales” (eso vive en cambios posteriores).
- No definir un modelo de datos definitivo (ORM/DB) si no es imprescindible para el scaffold.
- No crear specs de capacidades en este paso (se harán en el artefacto `specs`).
- No optimizaciones avanzadas de observabilidad (tracing distribuido completo, métricas, etc.) más allá del Correlation ID y logging requerido.

## Decisions

- **Monorepo NestJS con `apps/api`**
  - **Decisión**: usar el layout estándar de Nest monorepo para facilitar tooling, testing y despliegue.
  - **Alternativas**: repo single-app o multi-repo.
  - **Racional**: el monorepo permite compartir foundations (error handling, auth, config) sin duplicación y mantiene una convención de estructura clara.

- **DDD estricto por módulo**
  - **Decisión**: forzar capas `domain/`, `application/`, `infrastructure/`, `api/` en cada módulo bajo `apps/api/src/modules/<module>/`.
  - **Alternativas**: arquitectura “feature folder” sin capas, o DDD parcial.
  - **Racional**: evita lógica en controllers, obliga a ports en `application/`, y desacopla dominio de Nest/DB.

- **Paginación obligatoria como contrato reutilizable**
  - **Decisión**: estandarizar paginación en `application/` con `PageRequest` y `PageResult<T>` (incluyendo `items` y `meta` con `totalItems`, `page`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`, `nextPage`, `previousPage`).
  - **Decisión**: validar `page >= 1`, `pageSize >= 1` y aplicar un máximo configurable por env (clamp consistente o 400; se define una sola política para toda la API).
  - **Alternativas**: paginación ad-hoc por endpoint o endpoints que retornan colecciones completas.
  - **Racional**: cumplimiento hard-rule de “no listados sin paginar”, consistencia para UI y orden determinístico para evitar resultados “saltando” entre páginas.

- **ConfigModule global + validación de envs (fail-fast)**
  - **Decisión**: centralizar lectura de envs en `apps/api/src/config/` con:
    - `configuration.ts` (env → config tipada),
    - `env.validation.ts` (schema y validación),
    - `config.module.ts` (registro global).
  - **Alternativas**: leer `process.env` directamente en módulos o defaults silenciosos.
  - **Racional**: elimina “magic config”, evita correr en estados inseguros y habilita portabilidad dev/qa/prod.

- **Correlation ID como concern transversal**
  - **Decisión**: un interceptor/middleware global que garantice `correlationId` por request (entrante o generado) y lo propague a:
    - logs,
    - respuestas (campo en contrato de error y opcional header de salida).
  - **Alternativas**: generar IDs solo en errores, o per-controller.
  - **Racional**: la trazabilidad debe existir siempre y ser consistente para depurar e2e y producción.

- **Logging con NestJS Logger + sanitización**
  - **Decisión**: usar `Logger` de Nest (o wrapper 1:1) asegurando que el contexto refleje el caller real (no ocultar el origen).
  - **Alternativas**: `console.log`, o un logger central que pierda contexto.
  - **Racional**: consistencia de niveles, integración con Nest, y cumplimiento de redacción y correlación.

- **Contrato de error único mediante Global Exception Filter + catálogo**
  - **Decisión**: un único handler global que traduzca excepciones a:
    - `status`, `errorCode`, `message`, `technicalMessage`, `correlationId`, `timestamp`, `details?`.
  - **Alternativas**: `HttpException` con bodies ad-hoc en controllers.
  - **Racional**: el cliente consume un contrato estable y el backend mantiene logs técnicos completos sin filtrar detalles.

- **RBAC deny-by-default como guard global**
  - **Decisión**: guard global que aplique:
    - 401 si no hay autenticación válida,
    - 403 si hay autenticación pero no cumple permisos/roles,
    - deny-by-default si el endpoint no define metadata RBAC.
  - **Alternativas**: proteger solo algunos endpoints, o “allow-by-default”.
  - **Racional**: elimina el riesgo de exponer endpoints accidentalmente.

- **Swagger desacoplado del controller**
  - **Decisión**: decoradores compuestos por endpoint en `apps/api/src/modules/<module>/api/swagger/`.
  - **Alternativas**: decoradores inline extensos en controllers.
  - **Racional**: controllers limpios, documentación mantenible y consistente.

- **Testing base (unit + e2e) desde el día 1**
  - **Decisión**: incluir setup mínimo para que cada endpoint futuro nazca con tests unit + e2e.
  - **Alternativas**: “probar manualmente” o posponer e2e.
  - **Racional**: reduce regresiones y fuerza contratos de API coherentes.

## Risks / Trade-offs

- **[Más estructura inicial] →** puede sentirse “pesado” para iterar rápido.
  - **Mitigación**: el scaffold es una inversión única; se proveen convenciones claras para evitar fricción y retrabajo.

- **[Deny-by-default RBAC bloquea dev temprano] →** endpoints iniciales podrían dar 403/401 si falta metadata.
  - **Mitigación**: definir decoradores simples (`@RequirePermissions`, `@Public`) y plantillas de endpoint + tests que incluyan 401/403/2xx.

- **[Catálogo de errores incompleto al inicio] →** riesgo de errores 500 genéricos.
  - **Mitigación**: incluir un `INTERNAL.UNEXPECTED` base y reglas para agregar entradas al catálogo al introducir nuevas excepciones.

- **[Sanitización insuficiente] →** riesgo de filtrar PII/secrets en logs.
  - **Mitigación**: lista explícita de claves a redactar + tests unitarios del sanitizer y defaults conservadores (no log payloads si `LOG_DEBUG_PAYLOADS=false`).

- **[Paginación sin orden estable] →** resultados inconsistentes entre páginas.
  - **Mitigación**: requerir `sortBy/sortDirection` donde aplique y definir un default estable (ej. `createdAt desc`) para todas las búsquedas/listados.

## Migration Plan

- Implementar el scaffold monorepo (`apps/api`) y asegurar que el proceso falla al boot si faltan envs requeridas (fail-fast).
- Introducir foundations transversales de forma incremental pero manteniendo compatibilidad:
  - Correlation ID + logging (sin cambios de API públicos salvo headers opcionales).
  - Exception filter global + catálogo (define contrato de error estable desde el día 1).
  - Guard global RBAC deny-by-default (todo endpoint nuevo debe declarar metadata explícita).
- Definir y reutilizar `PageRequest/PageResult` antes de introducir endpoints de listados/búsquedas.
- Estrategia de rollback: revertir el deployment a la versión anterior (no hay migraciones de datos planificadas en este cambio).

## Open Questions

- **Política para `pageSize` > máximo**: ¿clamp al máximo (preferido por UX) o responder 400? (Debe ser consistente globalmente).
- **Formato de propagación de `correlationId`**: además del contrato de error, ¿se agrega siempre un header de respuesta (ej. `x-correlation-id`)?
- **Auth base**: ¿JWT desde el inicio o se deja un “stub” de autenticación solo para forzar RBAC y tests 401/403/2xx?
