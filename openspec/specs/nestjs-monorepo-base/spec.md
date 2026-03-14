## Purpose

Definir la base arquitectónica del backend AnyJobs como monorepo NestJS con DDD estricto por módulo.

## Requirements

### Requirement: Monorepo NestJS layout
El repositorio MUST seguir el layout de monorepo de NestJS, incluyendo como mínimo `apps/api/src/main.ts` y `apps/api/src/app.module.ts`.

#### Scenario: Scaffold inicial del monorepo
- **WHEN** se inicializa el proyecto base
- **THEN** existe `apps/api/src/main.ts` y `apps/api/src/app.module.ts` y la app puede bootear usando ese entrypoint

### Requirement: Estructura DDD por módulo
Todo módulo bajo `apps/api/src/modules/<module>/` MUST incluir las carpetas `domain/`, `application/`, `infrastructure/` y `api/`.

#### Scenario: Creación de un módulo nuevo
- **WHEN** se crea un módulo `<module>` nuevo
- **THEN** el árbol del módulo contiene `domain/`, `application/`, `infrastructure/` y `api/`

### Requirement: Reglas de dependencias por capa (DDD estricto)
El código en `domain/` MUST NOT depender de NestJS, HTTP, DB u otras librerías de infraestructura. El código en `application/` MUST depender solo de `domain/` y `application/ports/*` (interfaces). `api/` MUST invocar casos de uso y MUST NOT contener lógica de negocio.

#### Scenario: Compilación y revisión de imports
- **WHEN** se revisan imports de una feature implementada en un módulo
- **THEN** `domain/` no importa NestJS/ORM/HTTP y `api/` no accede a repositorios concretos ni implementa lógica de negocio

