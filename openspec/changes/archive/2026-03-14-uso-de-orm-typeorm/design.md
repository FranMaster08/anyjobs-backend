## Context

El monorepo NestJS de AnyJobs hoy opera sin un estándar de persistencia (no hay ORM, ni variables `DB_*`, ni flujo de migraciones). En el `AppModule` se incluye un `InMemoryModule` que permite desarrollar features sin DB, pero esto limita:

- repositorios reales por módulo (DDD),
- E2E determinísticos (con estado persistente controlado),
- evolución del modelo de datos (relaciones e integridad referencial),
- observabilidad consistente entre HTTP → application → DB.

El cambio propone adoptar TypeORM como ORM principal y establecer una base de persistencia reutilizable. Hay constraints transversales ya definidos en el repo:

- **DDD estricto por módulo**: `domain/` puro y sin dependencias de ORM; `application/` orquesta y depende de puertos; `infrastructure/` implementa puertos.
- **Config por env + fail-fast**: ninguna lectura directa de `process.env` fuera de `apps/api/src/config/*`.
- **Logging con correlationId**: todos los logs deben incluir `correlationId` y respetar niveles; no `console.log`.
- **Testing por endpoint**: unit tests sin DB real; E2E determinísticos.

## Goals / Non-Goals

**Goals:**
- Definir una **fundación TypeORM** para NestJS que habilite:
  - conexión a DB configurada por `DB_*` y validada fail-fast,
  - migraciones ejecutables en dev/ci/prod,
  - exposición de `DataSource` y repositorios a la capa `infrastructure/`.
- Establecer un **patrón de repositorios por módulo**:
  - puertos en `application/ports/*`,
  - adaptadores concretos con TypeORM en `infrastructure/`,
  - modelos de persistencia (entities TypeORM) encapsulados en infraestructura.
- Incorporar un enfoque de **observabilidad** para DB consistente con el estándar:
  - logs técnicos internos con `correlationId`,
  - sanitización (no secretos),
  - control por `LOG_LEVEL`/`LOG_DEBUG_PAYLOADS`.
- Definir estrategia de **tests**:
  - unit tests continúan sin DB (mocks de puertos),
  - E2E corren contra DB de test repetible (preferible Postgres en contenedor) o alternativa equivalente.

**Non-Goals:**
- Diseñar el modelo de datos completo de todos los módulos (solo lineamientos y patrón).
- Cambiar contratos HTTP, RBAC, paginación, swagger o error handling (salvo lo estrictamente necesario para wiring de persistencia).
- Introducir comunicación service-to-service por HTTP (sigue prohibido; no aplica a persistencia).
- Optimizar performance avanzada (índices/particionado) más allá de defaults razonables.

## Decisions

### 1) ORM estándar: TypeORM (con NestJS)

**Decisión:** Adoptar TypeORM como ORM oficial.

**Rationale:**
- Encaja con el stack actual de NestJS y su ecosistema (`@nestjs/typeorm`).
- Permite modelar relaciones explícitas, migraciones y transacciones, alineado con el requisito de “entidades no aisladas”.

**Alternativas consideradas:**
- Prisma: muy productivo, pero introduce otro modelo (schema.prisma) y un estilo distinto de repositorios que puede tensionar DDD por módulos; además, su mapeo a entidades de dominio suele ser más “DTO-driven”.
- MikroORM: fuerte en DDD, pero menor estandarización interna actual del repo y menor familiaridad del equipo (asunción).

### 2) “TypeORM entities” como modelos de persistencia (no dominio)

**Decisión:** Las clases decoradas con TypeORM (p. ej. `@Entity()`) se tratarán como **modelos de persistencia** y vivirán en `infrastructure/` (por módulo), no en `domain/`.

**Rationale:**
- Mantiene el dominio puro (sin decorators, sin dependencias ORM).
- Permite que el dominio evolucione sin acoplarse a estrategia de almacenamiento.

**Implicación:** Es normal tener:
- Entidades/VO del dominio (puras) y
- Entidades de persistencia (TypeORM) + mappers (infra) entre ambos.

### 3) Wiring Nest: módulo de persistencia compartido + módulos por feature

**Decisión:** Introducir un módulo compartido de persistencia (ej. `shared/persistence`) responsable de:
- crear/configurar el `DataSource`,
- registrar TypeORM globalmente,
- exponer providers reutilizables.

Los módulos funcionales sólo:
- declaran puertos en `application/ports`,
- implementan adaptadores concretos en `infrastructure/`,
- registran sus entidades TypeORM y repositorios concretos en su DI local (sin filtrar hacia `domain/`/`application/`).

**Alternativas consideradas:**
- Configurar TypeORM en cada módulo: aumenta duplicación y riesgo de inconsistencias.
- Mantener todo en `AppModule`: escala mal y rompe modularidad.

### 4) Configuración DB por env con validación estricta

**Decisión:** Agregar variables `DB_*` al `.env.example` y al schema de validación en `apps/api/src/config/` (fail-fast).

**Set mínimo esperado (propuesto):**
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `DB_SSL` (boolean)
- `DB_LOGGING` (boolean) y/o respetar `LOG_LEVEL` para granularidad
- `DB_MIGRATIONS_RUN` (boolean) para controlar ejecución automática en runtime
- `DB_SYNCHRONIZE` **siempre false por defecto** (y probablemente prohibido en prod)

**Rationale:**
- Cumple `config-by-env`.
- Evita defaults inseguros y fallos silenciosos.

### 5) Migraciones como fuente de verdad del esquema

**Decisión:** Usar migraciones TypeORM y un flujo explícito (scripts) para:
- generar/editar migraciones,
- ejecutar `migration:run`,
- ejecutar `migration:revert`.

**Rationale:**
- Evita `synchronize` en entornos reales.
- Habilita despliegues controlados y rollback.

**Nota de arquitectura:** Para respetar la regla de no leer `process.env` fuera de `config/`, la configuración utilizada por migraciones debe construirse desde `apps/api/src/config/*` (y/o desde el mismo schema/loader), evitando duplicación.

### 6) Logging DB con correlationId (sin filtrar secretos)

**Decisión:** Integrar logs de DB alineados al estándar:
- en modo normal: logs mínimos (errores y warnings relevantes),
- en modo debug: queries/tiempos sanitizados (sin parámetros sensibles), con `correlationId`.

**Enfoque propuesto:**
- Implementar un logger de TypeORM que delegue al `Logger` de NestJS.
- Obtener `correlationId` desde el mecanismo compartido de correlación (p. ej. AsyncLocalStorage detrás de `CorrelationModule`), de modo que el logger (singleton) pueda incluir el ID del request actual cuando exista.

**Trade-off:** TypeORM no es request-scoped; la correlación depende de una implementación robusta de contexto asíncrono.

### 7) Estrategia de tests: unit sin DB; E2E con DB controlada

**Decisión:** Mantener el estándar:
- unit tests: mock de puertos (sin TypeORM),
- E2E: DB real de test (preferible Postgres en contenedor) con migraciones aplicadas al inicio de la suite.

**Alternativas consideradas:**
- SQLite in-memory para E2E: más rápido, pero menor fidelidad (SQL/constraints distintas) y puede requerir dependencias extra.

## Risks / Trade-offs

- **[Complejidad por doble modelo (dominio vs persistencia)] → Mitigación:** definir convenciones claras de mappers y ubicación (`infrastructure/*/mappers`), mantener entidades TypeORM fuera de `domain/`.
- **[Migrations desincronizadas con código] → Mitigación:** pipeline de CI que ejecute migraciones sobre DB limpia; disciplina de “migration per change”.
- **[E2E lentos por DB en contenedor] → Mitigación:** reutilizar contenedor por suite, aplicar migraciones una vez, y usar transacciones/cleanup determinístico.
- **[CorrelationId no disponible en logs de DB] → Mitigación:** asegurar que el módulo de correlación use un mecanismo compatible con async context; si falla, degradar a logs sin correlationId sólo para DB (pero mantenerlo en HTTP/app).
- **[Riesgo de filtrar secretos en logs SQL] → Mitigación:** sanitización obligatoria; no loguear parámetros crudos; toggle `LOG_DEBUG_PAYLOADS` para habilitar detalle.
- **[Modelado relacional “forzado”] → Mitigación:** permitir excepciones explícitas (catálogos/tablas técnicas) documentadas en el módulo correspondiente.

## Migration Plan

- Agregar dependencias (TypeORM, integración Nest, driver Postgres) y actualizar lockfile.
- Extender `apps/api/src/config/*` con `DB_*` + validación fail-fast y actualizar `.env.example`.
- Crear módulo compartido de persistencia y wiring en `AppModule`.
- Definir estructura por módulo para persistencia:
  - entities TypeORM en `infrastructure/`,
  - repositorios concretos en `infrastructure/adapters/`,
  - puertos en `application/ports/`.
- Incorporar el flujo de migraciones y generar una migración inicial (si aplica).
- Actualizar E2E para levantar la app con DB de test, correr migraciones y asegurar determinismo.
- Mantener `InMemoryModule` sólo para unit tests o como fallback explícito por env durante transición (si se decide).

## Open Questions

- ¿DB objetivo para dev/prod desde el día 1: Postgres obligatorio, o se permite otra por env?
- ¿E2E correrá con Postgres en contenedor (recomendado) o se habilita SQLite como alternativa rápida?
- Convención de naming: nombres de tablas, columnas, índices, y estrategia de timestamps (UTC) y soft deletes (si aplica).
- Política de transacciones por caso de uso: ¿se resuelve por “Unit of Work” en infraestructura o por transacciones explícitas en repositorios?

