## 1. Docker base y contexto de build

- [x] 1.1 Crear `.dockerignore` en la raíz con exclusiones mínimas obligatorias (`node_modules`, `dist`, `coverage`, `.git`, `.env*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, caches y logs locales)
- [x] 1.2 Verificar que el build context no incluya secretos/artefactos locales (inspección de contexto y size) y ajustar `.dockerignore` si es necesario
- [x] 1.3 Documentar en README/guía interna la política “no secretos en imágenes” y el uso de variables de entorno en runtime

## 2. Dockerfile multi-stage (targets dev/ci/prod)

- [x] 2.1 Crear `Dockerfile` multi-stage en la raíz con stages `deps`, `build`, `test` (opcional), `deps-prod` y `runtime`
- [x] 2.2 Implementar instalación reproducible con `npm ci` (lockfile) y estructura de layers cacheables (copiar `package*.json` antes que el código)
- [x] 2.3 Implementar stage `build` ejecutando `npm run build` y validando output en `dist/apps/api/main.js`
- [x] 2.4 Implementar stage `test` que ejecute unit tests (`npm test`) de forma reproducible (sin dependencias externas)
- [x] 2.5 Implementar stage `deps-prod` con dependencias de producción בלבד y preparar copia hacia runtime
- [x] 2.6 Implementar stage `runtime` que copie solo `dist/apps/api/**` + `node_modules` de producción + archivos mínimos necesarios

## 3. Runtime seguro (producción)

- [x] 3.1 Seleccionar imagen base de runtime mínima (preferentemente distroless Node.js) y configurar `CMD` para ejecutar `node dist/apps/api/main.js`
- [x] 3.2 Configurar ejecución como usuario no-root en runtime y asegurar permisos/ownership correctos para los artefactos copiados
- [x] 3.3 Definir estrategia de healthcheck compatible con imágenes sin shell (exec form) o documentar que el healthcheck lo provee el orquestador
- [x] 3.4 Verificar que el runtime no incluya toolchains (Nest CLI/TypeScript), caches ni dependencias de desarrollo

## 4. Desarrollo local con contenedores

- [x] 4.1 Crear `docker-compose.yml` (o `compose.yaml`) para dev con `api` + `postgres` usando variables desde `.env` local (sin copiar al build)
- [x] 4.2 Implementar target `dev` (o equivalente) para `nest start api --watch` y montar el código como volumen para hot reload
- [x] 4.3 Documentar comandos de dev: levantar stack, logs, rebuild, y variables mínimas requeridas (alineadas a `.env.example`)

## 5. CI/CD y build reproducible

- [x] 5.1 Documentar comandos estándar de CI: build `--target test` y build `--target runtime`
- [x] 5.2 Agregar guía para ejecutar E2E en CI mediante `docker compose` (app + postgres) sin acoplar E2E al build de imagen de producción
- [x] 5.3 Documentar uso de BuildKit/cache y compatibilidad con multi-plataforma (Buildx) incluyendo ejemplo de comando `--platform linux/amd64,linux/arm64`
- [x] 5.4 Definir convención de tagging/versionado de imágenes (p. ej. git sha) y checklist mínimo previo a publicar (tests ok)

## 6. Verificaciones y endurecimiento final

- [x] 6.1 Validar que el contenedor falla fast si faltan envs requeridas (por schema actual) y que `APP_PORT` controla el puerto de escucha
- [x] 6.2 Validar tamaño y contenido de la imagen final (solo runtime necessities) y registrar métricas antes/después
- [x] 6.3 Opcional: agregar imagen/target “debug” basada en Node slim para troubleshooting, dejando explícito que no es para producción
