## ADDED Requirements

### Requirement: Docker image is the standard deployment artifact
El artefacto estándar para despliegue MUST ser una imagen Docker construida a partir del `Dockerfile` del repositorio. El despliegue MUST NOT depender de precondiciones implícitas del host (toolchain instalada, paths locales).

#### Scenario: Deploy uses Docker image, not host build
- **WHEN** un ambiente de despliegue toma el artefacto del release
- **THEN** ese artefacto es una imagen Docker versionada lista para ejecutar la app con configuración por env

### Requirement: Image supports versioned publishing
La estrategia de empaquetado MUST soportar publicación de imágenes versionadas (tag) para trazabilidad (al menos: tag por commit o release).

#### Scenario: Image is traceable to source revision
- **WHEN** se publica una imagen al registry
- **THEN** existe un tag que permite identificar de forma unívoca la revisión de código que la generó

