## Purpose

Estandarizar el modelado relacional para que la persistencia represente explícitamente las relaciones del dominio (ownership, integridad referencial, límites de agregado) manteniendo el dominio independiente del ORM.

## Requirements

### Requirement: Las entidades persistentes deben expresar relaciones de dominio explícitas
El modelo de persistencia MUST representar relaciones explícitas entre entidades de acuerdo con el dominio (cardinalidades reales, integridad referencial y ownership). El sistema MUST evitar entidades/tablas “huérfanas” sin contexto relacional, salvo excepciones justificadas.

#### Scenario: Modelado de una entidad dependiente
- **WHEN** se introduce una entidad persistente que depende del ciclo de vida de otra (ownership)
- **THEN** se modela una relación explícita (por ejemplo `many-to-one/one-to-many` o `one-to-one`) y se asegura integridad referencial

### Requirement: Excepciones a la regla relacional deben documentarse y justificarse
Si una tabla/entidad persistente existe sin relaciones (por ejemplo catálogos, tablas de referencia o registros técnicos), esa excepción MUST estar documentada y MUST incluir la razón y el criterio de estabilidad.

#### Scenario: Tabla de catálogo
- **WHEN** se modela una tabla de referencia estable (catálogo) que no requiere relaciones de integridad
- **THEN** se documenta explícitamente como excepción, indicando razón y criterios de mantenimiento

### Requirement: El modelado relacional debe preservar límites de agregado
Cuando el dominio defina agregados, el diseño de persistencia MUST respetar los límites de agregado: referencias entre agregados MUST evitar acoplamientos innecesarios y MUST clarificar ownership y consistencia.

#### Scenario: Referencia entre agregados
- **WHEN** una entidad de un agregado necesita referenciar a otro agregado
- **THEN** se modela la referencia de forma explícita (por clave/relación) sin mezclar ciclos de vida, y se documenta el límite del agregado

### Requirement: Mapeo entre dominio y persistencia es responsabilidad de infraestructura
La transformación entre modelos de dominio (puro) y modelos de persistencia (TypeORM) MUST vivir en `infrastructure/` (mappers/adapters). El dominio MUST mantenerse independiente del esquema relacional.

#### Scenario: Persistencia de un agregado
- **WHEN** un caso de uso necesita persistir un agregado
- **THEN** la infraestructura mapea dominio ↔ persistencia sin introducir dependencias ORM en `domain/`

