## Context

El repositorio es un monorepo NestJS con una app `api` ubicada en `apps/api/`. Hoy no existe un estándar formal de containerización (no hay `Dockerfile`, `.dockerignore` ni `docker-compose`), por lo que:

- el build y el runtime dependen del entorno local/CI (toolchain instalada, versiones, paths);
- la imagen final (si se arma ad-hoc) puede incluir dependencias y artefactos no requeridos para runtime;
- se dificulta la reproducibilidad y el endurecimiento (principio de mínima superficie).

La aplicación valida variables de entorno al boot (fail-fast) y requiere, como mínimo, `APP_PORT`, `LOG_LEVEL`, paginación (`PAGINATION_*`) y configuración de DB (`DB_*`). El build actual se realiza con `npm` + `package-lock.json` y genera artefactos en `dist/apps/api` (`nest build api`). El arranque en runtime esperado es con Node ejecutando `dist/apps/api/main.js`.

Restricciones clave (del `proposal`):
- Dockerfile multi-stage.
- Imagen final de producción mínima (preferible distroless) y ejecución como usuario no-root.
- No incluir secretos ni `.env` dentro de la imagen.
- Separación clara entre imagen de desarrollo y producción.
- Compatibilidad con CI/CD, cache y potencial multi-plataforma.

## Goals / Non-Goals

**Goals:**
- Definir un estándar único de containerización para build, test y ejecución del proyecto.
- Proveer targets explícitos para:
  - **dev** (watch/hot reload),
  - **ci** (validación: build + tests),
  - **prod** (runtime mínimo y endurecido).
- Asegurar builds reproducibles (lockfile + `npm ci`) y aprovechar cache de BuildKit.
- Minimizar el contenido de la imagen final (solo `dist/` + dependencias de producción + archivos mínimos).
- Ejecutar en producción como usuario no-root y sin herramientas de administración dentro del contenedor.
- Mantener compatibilidad con builds multi-arquitectura (p. ej. `linux/amd64`, `linux/arm64`) vía Buildx.

**Non-Goals:**
- Definir manifests de despliegue (Kubernetes/Helm/Terraform) o un pipeline CI específico del proveedor.
- Resolver observabilidad completa (APM, tracing) más allá de lo requerido para operar imágenes mínimas.
- Hacer debugging interactivo dentro de la imagen de producción (distroless no lo habilita por diseño).
- Rediseñar el sistema de configuración por env (ya existe validación con Zod).

## Decisions

### 1) Package manager y reproducibilidad
- **Decisión**: usar `npm ci` como mecanismo estándar de instalación (apoyado por `package-lock.json`).
- **Rationale**: garantiza reproducibilidad y falla si el lock no está alineado con `package.json`.
- **Alternativas consideradas**:
  - `npm install`: menos determinista.
  - Migrar a `pnpm/yarn`: mayor cambio transversal (fuera de alcance de esta etapa de diseño).

### 2) Layout de Dockerfile multi-stage (targets: dev/ci/prod)
- **Decisión**: implementar un único `Dockerfile` con múltiples targets:
  - `deps` (instala dependencias completas para build/test),
  - `build` (compila `nest build api` → `dist/apps/api`),
  - `test` (opcional; ejecuta unit tests),
  - `deps-prod` (instala dependencias solo de producción),
  - `runtime` (final; copia `dist/` + `node_modules` de prod).
- **Rationale**: separa toolchain de runtime, reduce tamaño y superficie de ataque, y permite que CI ejecute validaciones sin duplicar lógica.
- **Alternativas consideradas**:
  - Dockerfiles separados (dev/prod): más duplicación y deriva.
  - Instalar dependencias dentro de la imagen distroless: inviable (no trae package manager).

### 3) Imagen base para build vs runtime de producción
- **Decisión**:
  - build/test: imagen oficial de Node (Debian slim) para compatibilidad y tooling.
  - prod runtime: **distroless Node.js** (Debian) para minimizar superficie (sin shell, sin package manager).
- **Rationale**: distroless endurece el runtime y reduce CVEs por eliminar utilidades innecesarias; mantener familia Debian reduce fricción con dependencias nativas si existieran.
- **Alternativas consideradas**:
  - Alpine: imagen menor, pero mayor probabilidad de fricción (musl) con paquetes nativos.
  - Node slim en prod: más simple de diagnosticar, pero incrementa superficie de ataque.

### 4) Usuario no-root y permisos de filesystem
- **Decisión**: ejecutar en prod como usuario no-root (`nonroot`) y garantizar ownership/permisos correctos al copiar artefactos.
- **Rationale**: reduce impacto de una eventual RCE dentro del contenedor.
- **Alternativas consideradas**:
  - `root` con hardening parcial: no cumple la restricción del proposal.

### 5) Variables de entorno y secretos
- **Decisión**: no copiar `.env` ni secretos al contenedor; la configuración se inyecta en runtime (compose/CI/orquestador).
- **Rationale**: alinea con el esquema de validación existente y evita leakage de credenciales en imágenes.
- **Alternativas consideradas**:
  - bake-in de `.env`: prohibido.
  - build args para secretos: sólo si fuera imprescindible, usando mecanismos de secretos de BuildKit (`--secret`) y nunca persistiendo en layers.

### 6) Cache y performance de build
- **Decisión**: habilitar BuildKit y cachear:
  - cache de `npm` (descargas),
  - layers de dependencias separadas de la app (copiado de `package*.json` primero).
- **Rationale**: acelera CI y desarrollo, y reduce costo de builds.
- **Alternativas consideradas**:
  - builds “planos” sin cache: más lentos e inconsistentes.

### 7) Multi-plataforma (Buildx)
- **Decisión**: el estándar debe ser compatible con `docker buildx build --platform linux/amd64,linux/arm64`.
- **Rationale**: habilita equipos mixtos (Apple Silicon) y despliegues modernos sin bifurcar artefactos.
- **Alternativas consideradas**:
  - single-arch: simplifica, pero limita portabilidad.

### 8) Estrategia de tests en contenedores
- **Decisión**:
  - `test` target ejecuta unit tests (sin dependencias externas).
  - E2E se ejecuta en CI con `docker compose` (app + postgres) o pipeline equivalente, no dentro del build de la imagen de producción.
- **Rationale**: mantener el build de prod independiente del entorno (DB) y evitar que el build “dependa” de servicios externos.
- **Alternativas consideradas**:
  - correr E2E dentro del Docker build: agrega complejidad y acopla build a servicios.

## Risks / Trade-offs

- **[Distroless reduce debugging interactivo]** → Mitigación: proveer target/imagen “debug” basada en Node slim (solo para troubleshooting), y depender de logs + observabilidad.
- **[Dependencias nativas podrían requerir toolchain/ABI]** → Mitigación: mantener build en Debian slim, y copiar `node_modules` de prod desde un stage compatible (Debian) al runtime distroless.
- **[E2E requieren DB y envs completos]** → Mitigación: definir `docker compose` de CI/QA con Postgres y variables mínimas, y documentar comandos repetibles.
- **[Cache mal configurado puede producir builds lentos]** → Mitigación: estructura por layers (lockfiles primero) y uso explícito de BuildKit cache mounts.

## Migration Plan

- Agregar `Dockerfile` multi-stage con targets `dev`, `test`, `runtime`.
- Agregar `.dockerignore` para excluir `node_modules`, `dist`, `.env*`, `coverage`, `.git`, artefactos locales y directorios no requeridos.
- Agregar `docker-compose` de desarrollo (API + Postgres) y, si aplica, un compose específico para CI.
- Documentar comandos estándar:
  - build prod,
  - run prod (inyección de envs),
  - run dev (watch),
  - correr tests en contenedor/compose.
- Integrar en CI: build + unit tests + (opcional) E2E con compose, scan/SBOM si el pipeline lo soporta.

Rollback:
- Revertir a ejecución host-based (scripts `npm run start:api:*`) y deshabilitar jobs de build de imágenes en CI si existieran.

## Open Questions

- Versión de Node a fijar como estándar (p. ej. 20 LTS) y política de upgrades.
- ¿Se necesita un endpoint de healthcheck público (y su política RBAC) o se delega al orquestador?
- ¿Se correrán migraciones automáticamente en runtime (`DB_MIGRATIONS_RUN`) o mediante job/step separado en el despliegue?
- ¿Dónde se publicarán las imágenes (registry) y cuál será el tagging/versionado (git sha, semver, environment tags)?
