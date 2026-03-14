## ADDED Requirements

### Requirement: Dockerfile uses multi-stage build with explicit targets
El `Dockerfile` MUST implementar un build multi-stage y exponer stages con nombres estables para soportar distintos objetivos:

- `deps`: instalación de dependencias necesarias para build/test.
- `build`: compilación del proyecto (`npm run build`) generando artefactos en `dist/apps/api`.
- `test` (opcional): ejecución de tests en un contenedor reproducible.
- `deps-prod`: instalación de dependencias de producción (sin dependencias de desarrollo).
- `runtime`: stage final de producción (mínimo).

#### Scenario: CI builds and selects targets deterministically
- **WHEN** CI ejecuta `docker build --target test` y `docker build --target runtime`
- **THEN** ambos builds son reproducibles y usan stages con nombres consistentes (sin depender de orden implícito)

### Requirement: Build stage produces the expected runtime entry artifact
El stage `build` MUST generar el artefacto de arranque del servicio en `dist/apps/api/main.js` (o su equivalente según `nest build api`), de forma que el runtime final lo ejecute con Node.

#### Scenario: Build output includes API main entrypoint
- **WHEN** se ejecuta el stage `build`
- **THEN** existe `dist/apps/api/main.js` y es el entrypoint que usará el contenedor en producción

### Requirement: Runtime stage contains only production necessities
El stage `runtime` MUST contener únicamente:

- artefactos compilados requeridos para ejecutar la API (`dist/apps/api/**`);
- dependencias de producción (`node_modules` de producción);
- archivos mínimos requeridos por Node (p. ej. `package.json` si fuera necesario).

El stage `runtime` MUST NOT incluir toolchain de build (TypeScript, Nest CLI), caches, ni dependencias de desarrollo.

#### Scenario: Final image excludes dev tooling
- **WHEN** se construye la imagen `runtime`
- **THEN** el contenedor puede iniciar la app sin incluir toolchains o dependencias de desarrollo

### Requirement: Dockerfile structure supports caching
El `Dockerfile` MUST estar estructurado para permitir caching efectivo de dependencias (separando copia de `package.json`/lockfile de la copia del código fuente), reduciendo tiempos de build en CI.

#### Scenario: Dependency layers are cacheable
- **WHEN** cambia código de aplicación sin cambiar `package-lock.json`
- **THEN** el layer de instalación de dependencias puede reutilizarse desde cache en un build posterior

