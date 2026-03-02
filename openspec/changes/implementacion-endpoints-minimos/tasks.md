## 1. Preparación (cross-cutting)

- [x] 1.1 Alinear contrato de errores global: filtro global + catálogo de errores + `correlationId` siempre en respuesta (mantener `message` para compatibilidad)
- [x] 1.2 Alinear paginación estándar: utilidades `PageRequest`/`PageResult` (items+meta) y límites `pageSize` por env
- [x] 1.3 Alinear auth/RBAC: guard global deny-by-default + decoradores (`@Public` / `@RequirePermissions`) + estrategia MVP (cookie/session o equivalente)
- [x] 1.4 Alinear logging: `Logger` con `correlationId` propagado y sanitización de payloads

## 2. Módulo Auth (`/auth`)

- [x] 2.1 Crear estructura DDD del módulo `auth` (domain/application/infrastructure/api) + `auth.module.ts`
- [x] 2.2 DTOs de Auth con Swagger por propiedad (requests/responses + ejemplos) según specs
- [x] 2.3 Swagger compuesto por endpoint en `api/swagger/*` (sin Swagger “grande” en controller)
- [x] 2.4 Implementar `POST /auth/register` (usuario PENDING + registration flow cookie) + unit tests del caso de uso
- [x] 2.5 Implementar `POST /auth/verify-email` (otpCode sin userId; resuelve por flow) + unit tests
- [x] 2.6 Implementar `POST /auth/verify-phone` (otpCode sin userId; resuelve por flow) + unit tests
- [x] 2.7 Implementar `GET /auth/email-available` + unit tests
- [x] 2.8 Implementar `GET /auth/phone-available` + unit tests
- [x] 2.9 Implementar `POST /auth/login` (token o sesión) + unit tests
- [x] 2.10 E2E Auth: happy path register + verify + login y error path (401 sin flow en verify / 400 invalid input)

## 3. Módulo User Profile (`/users/me/*`)

- [x] 3.1 Crear estructura DDD del módulo `user-profile` + `user-profile.module.ts`
- [x] 3.2 DTOs de User Profile con Swagger por propiedad + ejemplos según specs
- [x] 3.3 Swagger compuesto por endpoint en `api/swagger/*`
- [x] 3.4 Implementar `PATCH /users/me/location` (204) + unit tests del caso de uso
- [x] 3.5 Implementar `PATCH /users/me/worker-profile` (validación min 1 category si WORKER) + unit tests
- [x] 3.6 Implementar `PATCH /users/me/client-profile` + unit tests
- [x] 3.7 Implementar `PATCH /users/me/personal-info` (campos requeridos si WORKER; birthDate YYYY-MM-DD) + unit tests
- [x] 3.8 E2E Users: 401 sin auth, 403 sin permiso, 204 con auth+permiso (al menos 2 endpoints)

## 4. Módulo Open Requests (`/open-requests`)

- [x] 4.1 Crear estructura DDD del módulo `open-requests` + `open-requests.module.ts`
- [x] 4.2 DTOs de Open Requests con Swagger por propiedad + ejemplos según specs
- [x] 4.3 Swagger compuesto por endpoint en `api/swagger/*`
- [x] 4.4 Implementar `GET /open-requests` paginado (items+meta) con orden estable; mantener `nextPage/hasMore` si el front lo requiere
- [x] 4.5 Implementar `GET /open-requests/{id}` asegurando `images: []` siempre presente
- [x] 4.6 E2E Open Requests: list (200) + detail (200) + not found (404)

## 5. Módulo Site Config (`/site-config`)

- [x] 5.1 Crear estructura DDD del módulo `site-config` + `site-config.module.ts`
- [x] 5.2 DTOs de Site Config con Swagger por propiedad + ejemplos según specs
- [x] 5.3 Swagger compuesto por endpoint en `api/swagger/*`
- [x] 5.4 Implementar `GET /site-config` (200) con estructura requerida
- [x] 5.5 E2E Site Config: 200 y shape mínimo (brandName/hero/sections)

## 6. Módulo Proposals (`/proposals`)

- [x] 6.1 Crear estructura DDD del módulo `proposals` + `proposals.module.ts`
- [x] 6.2 DTOs de Proposals con Swagger por propiedad + ejemplos según specs
- [x] 6.3 Swagger compuesto por endpoint en `api/swagger/*`
- [x] 6.4 Implementar `GET /proposals` con filtros + paginación estándar (items+meta) + orden estable
- [x] 6.5 Implementar `POST /proposals` (201 preferido) + validaciones mínimas
- [x] 6.6 E2E Proposals: 401 sin auth, 403 sin permiso, 201 con auth+permiso y error path 400

## 7. Integración final

- [x] 7.1 Asegurar wiring de módulos en `apps/api/src/app.module.ts` y que Swagger se publique correctamente
- [x] 7.2 Ejecutar suite de tests (unit + e2e) y corregir lints/typing si aparecen
