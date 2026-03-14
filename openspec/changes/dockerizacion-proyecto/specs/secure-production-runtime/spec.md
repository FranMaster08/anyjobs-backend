## ADDED Requirements

### Requirement: Production runtime image is minimal and hardened
La imagen final de producción MUST basarse en una imagen mínima y endurecida (preferentemente distroless para Node.js) y MUST NOT incluir shell ni package manager.

#### Scenario: Production image is non-interactive by design
- **WHEN** se ejecuta el contenedor de producción
- **THEN** no existe una shell disponible dentro de la imagen y el runtime contiene solo dependencias de ejecución

### Requirement: Production container runs as non-root
El contenedor de producción MUST ejecutar el proceso de Node como usuario no-root.

#### Scenario: Process is not root inside container
- **WHEN** la aplicación arranca dentro del contenedor de producción
- **THEN** el proceso se ejecuta con un UID/GID no privilegiado

### Requirement: Environment variables are required at runtime (no baked defaults for secrets)
La imagen de producción MUST asumir que la configuración se provee por variables de entorno en runtime y MUST NOT requerir archivos `.env` dentro del contenedor.

#### Scenario: Missing envs fail fast
- **WHEN** el contenedor se inicia sin variables requeridas (p. ej. `APP_PORT`, `LOG_LEVEL`, `DB_TYPE`)
- **THEN** la aplicación falla al inicio (fail-fast) según la validación existente de env

### Requirement: Health signaling is compatible with minimal images
Si se define un `HEALTHCHECK` en la imagen, MUST usar forma exec (sin shell) y MUST ser compatible con una imagen mínima (p. ej. ejecutando Node directamente). Si no se define, MUST documentarse que el healthcheck será responsabilidad del orquestador.

#### Scenario: Healthcheck does not require shell
- **WHEN** existe healthcheck configurado para el contenedor
- **THEN** éste se ejecuta sin depender de `/bin/sh` ni utilidades externas no presentes en distroless

