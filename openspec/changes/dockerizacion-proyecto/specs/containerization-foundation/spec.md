## ADDED Requirements

### Requirement: Standard Docker artifacts exist
El repositorio MUST incluir artefactos estándar de containerización para habilitar build, test y runtime reproducibles:

- `Dockerfile` en la raíz del repo (multi-stage; ver capability específica).
- `.dockerignore` en la raíz del repo.
- Documentación de uso para desarrollo/CI/producción (comandos de build/run y variables requeridas).

#### Scenario: Repository contains required artifacts
- **WHEN** un desarrollador clona el repositorio
- **THEN** existen `Dockerfile` y `.dockerignore` en la raíz y la documentación de uso describe cómo construir y ejecutar imágenes

### Requirement: Dockerignore excludes non-runtime and sensitive content
El repositorio MUST tener un `.dockerignore` que:

- MUST excluir artefactos grandes/no necesarios para build de imagen: `node_modules`, `dist`, `coverage`, `.git`.
- MUST excluir archivos de entorno y secretos: `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`.
- MUST excluir artefactos de tooling no requeridos para runtime: logs locales, caches y outputs de editor/OS.

La lista exacta de patrones puede evolucionar, pero estos grupos MUST estar cubiertos.

#### Scenario: Docker build context is reduced and safe
- **WHEN** se ejecuta `docker build` desde la raíz del repo
- **THEN** el contexto de build NO incluye `node_modules`, `dist` ni archivos `.env*`/keys y evita subir secretos a layers

### Requirement: No secrets are baked into images
La construcción de imágenes MUST NOT copiar secretos a la imagen (incluyendo archivos `.env`, credenciales, claves privadas o tokens). La configuración del servicio MUST inyectarse en runtime mediante variables de entorno u orquestador.

#### Scenario: Runtime configuration is injected, not baked
- **WHEN** se ejecuta el contenedor de producción
- **THEN** el proceso obtiene configuración desde variables de entorno y NO depende de archivos secretos incluidos en la imagen

