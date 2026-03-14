## Why

Hoy el backend no define un estándar de persistencia ni un ORM oficial, lo que bloquea la implementación de repositorios reales por módulo, dificulta ejecutar pruebas E2E con estado determinístico y obliga a depender de fakes ad-hoc para validar comportamiento. Esta ausencia también debilita la evolución del modelo de dominio, porque no existe una forma consistente de mapear entidades, relaciones, reglas de integridad y ciclos de vida de persistencia.

Adoptar TypeORM permitirá establecer una base técnica uniforme para acceso a datos, migraciones y repositorios, alineada a DDD y a una arquitectura limpia. Además, permitirá que el modelo persistente refleje correctamente la estructura del dominio: las entidades no deben existir como elementos aislados o “sueltos”, sino como parte de relaciones explícitas que representen agregados, asociaciones y dependencias reales del negocio.

## What Changes

- Se adopta **TypeORM** como ORM principal para el monorepo NestJS.
- Se incorpora una **capa compartida de infraestructura de persistencia** para inicializar la conexión, administrar migraciones y exponer `DataSource` y repositorios a los adaptadores de infraestructura.
- Se definen y documentan las variables de entorno `DB_*` y toggles relacionados, cumpliendo el principio de `config-by-env` con validación de esquema, fail-fast y `.env.example`.
- Se estandariza la implementación de repositorios por módulo dentro de `infrastructure/`, usando puertos definidos en `application/ports/*`, sin filtrar dependencias de TypeORM hacia `domain/` ni hacia `application/`.
- Se define una estrategia de pruebas donde:
  - las pruebas unitarias permanecen sin dependencia de base de datos;
  - las pruebas E2E utilizan una base de datos de prueba o una alternativa determinística equivalente;
  - se mantiene compatibilidad con el stack actual de Jest y Supertest.
- Se establece como regla de modelado que **las entidades persistentes no deben definirse de forma aislada**. Toda entidad debe formar parte de una estructura relacional coherente con el dominio, expresando explícitamente:
  - relaciones entre agregados y entidades dependientes;
  - claves foráneas e integridad referencial cuando aplique;
  - ownership y límites de ciclo de vida;
  - cardinalidades reales del negocio (`one-to-one`, `one-to-many`, `many-to-one`, `many-to-many`) solo cuando estén justificadas por el modelo.
- Se define que el diseño de persistencia debe evitar tablas o entidades “huérfanas” sin propósito relacional claro, salvo casos excepcionales debidamente justificados como catálogos, tablas de referencia o registros técnicos.
- Se documentan lineamientos para que el modelo relacional represente el dominio de manera explícita y mantenible, evitando colecciones arbitrarias de entidades desconectadas.

## Capabilities

### New Capabilities

- `typeorm-foundation`: Base de persistencia con TypeORM para NestJS, incluyendo configuración por ambiente, conexión, migraciones, wiring de DI y lineamientos de repositorios por módulo respetando DDD.
- `relational-domain-persistence`: Estandarización del modelado relacional para garantizar que las entidades persistentes expresen relaciones de dominio explícitas y no existan como estructuras sueltas o inconexas.

### Modified Capabilities

- `module-persistence-patterns`: Los módulos que persistan información deberán implementar sus repositorios siguiendo el patrón común definido y modelar sus entidades de acuerdo con relaciones consistentes del dominio.

## Impact

- **Código**: se afectarán principalmente `apps/api/src/config/` para incorporar configuración `DB_*`, validación y bootstrap; también `apps/api/src/` para registrar la infraestructura compartida de persistencia. Cada módulo que persista datos incorporará adaptadores en `infrastructure/` que implementen puertos de `application/ports/`.
- **Modelo de datos**: las entidades existentes y futuras deberán revisarse para asegurar que no queden definidas como estructuras aisladas. El modelo deberá expresar relaciones explícitas, ownership y consistencia referencial según la intención del dominio.
- **Dependencias**: se agregarán dependencias npm como `typeorm`, `@nestjs/typeorm` y el driver de base de datos correspondiente, proponiendo `pg` para Postgres como opción por defecto.
- **Operación**: será necesario configurar `DB_*` por ambiente e incorporar un flujo estándar de migraciones para bootstrap, despliegues y evolución controlada del esquema.
- **Pruebas**: las suites E2E podrán ejecutarse contra una base de datos controlada y reproducible, reduciendo la dependencia de dobles manuales de persistencia.
- **Arquitectura**: se refuerza la separación entre `domain`, `application` e `infrastructure`, asegurando que TypeORM quede encapsulado en infraestructura y que el dominio conserve independencia tecnológica.
- **Observabilidad**: las operaciones de base de datos deberán alinearse con logging estructurado y `correlationId`, sin exponer secretos ni credenciales, para mantener trazabilidad consistente entre HTTP, aplicación y persistencia.

## Design Constraints

- El dominio no debe depender de TypeORM.
- La aplicación no debe conocer detalles de entidades ORM ni decorators de persistencia.
- Los repositorios concretos deben vivir exclusivamente en infraestructura.
- Las entidades ORM deben modelar relaciones reales del dominio y no definirse como tablas sueltas sin contexto.
- Toda excepción a la regla relacional debe estar documentada y justificada explícitamente.