## 1. Scaffold del monorepo

- [x] 1.1 Inicializar el workspace NestJS en modo monorepo y crear `apps/api` como aplicación principal
- [x] 1.2 Crear `apps/api/src/main.ts` y `apps/api/src/app.module.ts` y verificar boot mínimo de la app
- [x] 1.3 Crear estructura base DDD por módulo en `apps/api/src/modules/<module>/{domain,application,infrastructure,api}` (al menos un módulo “ejemplo”)
- [x] 1.4 Asegurar reglas de dependencias por capa (domain puro, application solo domain+ports, api sin lógica de negocio)

## 2. Configuración por env + validación fail-fast

- [x] 2.1 Crear `apps/api/src/config/configuration.ts` (env → config tipada)
- [x] 2.2 Crear `apps/api/src/config/env.validation.ts` con schema (tipos/rangos/presencia) y validación fail-fast
- [x] 2.3 Crear `apps/api/src/config/config.module.ts` como módulo global y exponer `ConfigService` al resto de módulos
- [x] 2.4 Crear `.env.example` en la raíz con todas las variables requeridas (incluyendo logging y paginación)
- [x] 2.5 Verificar que la app NO inicia si falta una env requerida (test o verificación automatizable)

## 3. Correlation ID por request

- [x] 3.1 Implementar middleware/interceptor global que acepte `x-correlation-id` o genere uno si no viene
- [x] 3.2 Asegurar que el `correlationId` está disponible en todo el request (controllers, use-cases, infraestructura)
- [x] 3.3 (Si aplica) agregar header de salida `x-correlation-id` consistente con el contexto interno

## 4. Sanitización y logging estructurado (NestJS Logger)

- [x] 4.1 Implementar utilidad de sanitización/redacción de payloads (authorization/cookies/tokens/passwords/secrets/api keys/etc.)
- [x] 4.2 Implementar wrapper opcional (1:1) sobre NestJS `Logger` que preserve el contexto real del caller y agregue `correlationId`
- [x] 4.3 Implementar configuración por env de niveles (`LOG_LEVEL`) y toggle de payloads (`LOG_DEBUG_PAYLOADS`)
- [x] 4.4 Reemplazar cualquier uso de `console.log` (si existiera) por logging estándar

## 5. Catálogo de errores + contrato único de error

- [x] 5.1 Crear catálogo central de errores (`errorCode` → httpStatus + mensajes por defecto + severidad)
- [x] 5.2 Implementar Global Exception Filter que mapee excepciones → catálogo y responda con contrato estándar de error
- [x] 5.3 Asegurar que el contrato de error incluye `status`, `errorCode`, `message`, `technicalMessage`, `correlationId`, `timestamp`, `details?`
- [x] 5.4 Asegurar que el cliente NO recibe stack traces ni detalles internos; el backend sí loguea stack trace completo con contexto y `correlationId`

## 6. RBAC deny-by-default (seguridad desde el día 1)

- [x] 6.1 Definir decoradores de metadata RBAC (por ejemplo `@RequirePermissions(...)`/`@RequireRoles(...)`) y `@Public()` para excepciones
- [x] 6.2 Implementar guard global de autenticación + autorización con política deny-by-default
- [x] 6.3 Implementar respuestas correctas: 401 sin auth válida, 403 sin permiso, nunca “disfrazar” como 404/200
- [x] 6.4 Agregar logging `warn` para 403 y logging técnico en fallas internas del sistema de auth (con `correlationId`)

## 7. Paginación foundation (PageRequest/PageResult)

- [x] 7.1 Definir `PageRequest` (page, pageSize, sort, filters) y validaciones (`page>=1`, `pageSize>=1`)
- [x] 7.2 Definir `PageResult<T>` con `items` + `meta` (incluye `totalItems`, `totalPages`, flags y next/previous)
- [x] 7.3 Definir máximo configurable por env para `pageSize` y aplicar una política global consistente (400 o clamp)
- [x] 7.4 Definir convención de sort estable por defecto para listados/búsquedas (por ejemplo `createdAt desc`)

## 8. Swagger foundation (desacoplado del controller)

- [x] 8.1 Establecer estructura `apps/api/src/modules/<module>/api/swagger/` para decoradores “composite” por endpoint
- [x] 8.2 Definir convención para DTOs: descripción + ejemplo por propiedad y restricciones cuando aplique
- [x] 8.3 (Opcional) Añadir un endpoint mínimo (por ejemplo `GET /health`) con Swagger completo, marcándolo `@Public()` si aplica

## 9. Testing foundation (unit + e2e)

- [x] 9.1 Configurar Jest para unit tests del application layer (mockeando ports, sin DB real)
- [x] 9.2 Configurar base E2E con `supertest` y `TestingModule` para levantar la app en modo test
- [x] 9.3 Crear al menos 1 test E2E de smoke (por ejemplo `GET /health`) y 1 test E2E que verifique el contrato de error
- [x] 9.4 Crear plantilla/convención para futuros endpoints protegidos (tests 401/403/2xx)

## 10. Verificaciones finales del scaffold

- [x] 10.1 Verificar que el proyecto compila y levanta en modo dev y en modo test
- [x] 10.2 Verificar que el correlation id aparece en logs y en respuestas de error
- [x] 10.3 Verificar que la validación de envs falla al boot cuando corresponde (fail-fast)
- [x] 10.4 Verificar que la política deny-by-default bloquea endpoints sin metadata RBAC
