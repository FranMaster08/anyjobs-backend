## ADDED Requirements

### Requirement: CI can build and validate container images
El pipeline de CI MUST poder:

- construir la imagen (al menos target `runtime`);
- ejecutar validaciones mínimas en contenedor (al menos target `test` cuando aplique);
- fallar si el build o los tests fallan.

#### Scenario: CI validates image build
- **WHEN** se ejecuta el pipeline de CI en un commit
- **THEN** CI construye la imagen y reporta fallo si la construcción no es exitosa

### Requirement: CI supports multi-platform builds when required
Cuando el pipeline lo requiera, CI MUST soportar builds multi-plataforma (p. ej. `linux/amd64` y `linux/arm64`) usando una estrategia compatible con Docker Buildx.

#### Scenario: Multi-arch build is possible
- **WHEN** se configura el pipeline para construir múltiples arquitecturas
- **THEN** se puede producir una imagen multi-plataforma consistente a partir del mismo `Dockerfile`

