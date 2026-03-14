## ADDED Requirements

### Requirement: Runtime start command is independent of dev tooling
El contenedor MUST iniciar la API ejecutando Node sobre el artefacto compilado (sin depender de Nest CLI en runtime).

#### Scenario: Container starts from compiled output
- **WHEN** la imagen de producción se ejecuta
- **THEN** el proceso de arranque usa `node dist/apps/api/main.js` (o equivalente) y NO requiere `nest` instalado globalmente

### Requirement: Runtime behavior is consistent across local, CI and production
La aplicación MUST ejecutarse con el mismo artefacto (`dist/apps/api/**`) y las mismas dependencias de producción, cambiando únicamente la configuración por variables de entorno según el entorno (local/CI/prod).

#### Scenario: Same artifact runs in multiple environments
- **WHEN** se ejecuta la misma imagen con diferentes variables de entorno
- **THEN** la app arranca con el mismo build y la variación de comportamiento queda acotada a configuración por env

### Requirement: Container exposes a configurable listen port
El contenedor MUST permitir configurar el puerto de escucha mediante variables de entorno (alineado al contrato actual `APP_PORT`).

#### Scenario: Port is configurable
- **WHEN** se configura `APP_PORT` al ejecutar el contenedor
- **THEN** la aplicación escucha en el puerto configurado

