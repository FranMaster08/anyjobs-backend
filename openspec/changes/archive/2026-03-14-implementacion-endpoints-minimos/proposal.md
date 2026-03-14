## Why

Construir un backend HTTP **100% compatible** con el AnyJobs Front (Angular MVP), implementando exactamente los **endpoints** y **payloads** que el front consume hoy (o consumirá con mínima adaptación), para que pueda correr en modo “backend real” sin romper los flujos actuales.

## What Changes

- Se entrega un backend HTTP que expone estas sub-APIs (base path por token del front):
  - `/auth`
  - `/users`
  - `/open-requests`
  - `/site-config`
  - `/proposals` (mínimo recomendado para “backend real”)
- Se implementan **contratos request/response** en JSON tal como el front los espera, incluyendo:
  - **Auth**: registro, disponibilidad de email/teléfono, verificación OTP sin `userId` en request, login (token + snapshot de user).
  - **Users (/me)**: actualización de ubicación, worker profile, client profile y personal info (wizard).
  - **Open Requests**: listado paginado y detalle por id con estructura estable (incluyendo `images: []`).
  - **Site Config**: configuración inicial para bootstrap de home (brand/hero/sections).
  - **Proposals**: listado con filtros y create (sin impedir que el front siga usando `localStorage` si aún no consume estas rutas).
- Se estandariza manejo de errores de validación/negocio con respuesta `4xx` y body JSON simple:
  - `{ "message": "Texto legible para usuario" }`
  - (opcional futuro) `fieldErrors` por campo.

## Capabilities

### New Capabilities

- `auth`: Registro, disponibilidad, verificación OTP (sin `userId` en request) y login (token + user snapshot), manteniendo compatibilidad con el flujo de registro por etapas (wizard).
- `user-profile`: Endpoints `/users/me/*` para completar perfil (location, worker profile, client profile, personal info) con reglas mínimas según rol.
- `open-requests`: Navegación de “Open Requests” (list paginado + detail) con payloads estables para render en UI.
- `site-config`: Endpoint de bootstrap `/site-config` con estructura requerida por el front (brand/hero/sections).
- `proposals`: Backend mínimo para proposals (list con filtros + create) recomendado para producción.

### Modified Capabilities

<!-- N/A: no hay capacidades existentes todavía. -->

## Impact

- **Front-end compatibility**: el backend se convierte en el contrato fuente para el Angular MVP; cambios en payloads/status codes pueden romper flujos actuales.
- **Routing/base URLs**: el despliegue debe soportar base paths separados (`/auth`, `/users`, etc.) como los InjectionTokens del front.
- **Autenticación (MVP-compatible)**: se requiere una estrategia que permita `verify-email`/`verify-phone` **sin `userId`** en request, resolviendo el usuario del flujo vía mecanismo server-side (sesión/flujo temporal) sin exigir cambios inmediatos en el front.
- **Documentación y contratos**: endpoints y DTOs deben quedar documentados y versionables (Swagger por endpoint) para mantener compatibilidad.
- **Configuración por entorno**: URLs, secrets, toggles y comportamiento por ambiente deben ser configurables por variables de entorno, con validación fail-fast al arranque.
