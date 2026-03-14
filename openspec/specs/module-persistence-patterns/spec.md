## Purpose

Definir el patrón de persistencia por módulo (DDD) para que los casos de uso dependan de puertos en `application/ports/*`, las implementaciones concretas vivan en `infrastructure/`, y los tests permanezcan determinísticos (unit sin DB, E2E con DB controlada).

## Requirements

### Requirement: Puertos de repositorio en application y adaptadores en infraestructura
Cada módulo que persista datos MUST definir sus contratos como puertos en `application/ports/*`. Las implementaciones concretas de repositorio MUST vivir en `infrastructure/` y MUST implementar esos puertos.

#### Scenario: Caso de uso persiste datos
- **WHEN** un caso de uso en `application/` necesita leer/escribir datos
- **THEN** invoca un puerto (interface) y no usa TypeORM ni repositorios concretos

### Requirement: Controllers no acceden a persistencia directa
Los controllers MUST delegar al caso de uso y MUST NOT acceder a `DataSource`, repositorios TypeORM o consultas directas.

#### Scenario: Endpoint HTTP ejecuta una operación
- **WHEN** un endpoint requiere una operación que implica persistencia
- **THEN** el controller llama al caso de uso y no interactúa con repositorios/ORM

### Requirement: Entidades TypeORM y mappers sólo en infraestructura
Las entidades TypeORM (`@Entity`) y los mappers dominio↔persistencia MUST vivir en `infrastructure/` del módulo y MUST NOT exportarse hacia `domain/` o `application/`.

#### Scenario: Revisión de dependencias
- **WHEN** se inspeccionan imports desde `domain/` o `application/`
- **THEN** no existen imports hacia archivos de entidades TypeORM o mappers de infraestructura

### Requirement: Tests unitarios sin DB, E2E con DB determinística
Los unit tests MUST mockear puertos y MUST ejecutarse sin base de datos. Los E2E tests MUST ejecutarse contra una base de datos de test repetible (o alternativa determinística equivalente) y MUST aplicar migraciones/fixtures de forma controlada.

#### Scenario: Suite unitaria
- **WHEN** se ejecutan unit tests del módulo
- **THEN** no se requiere levantar una base de datos ni inicializar TypeORM

#### Scenario: Suite E2E
- **WHEN** se ejecutan E2E del API
- **THEN** la app corre con una DB de test limpia/determinística y el esquema está listo mediante migraciones antes de validar endpoints

