## Context

El monorepo ya define el contrato funcional de los módulos del MVP (`auth`, `user-profile`, `site-config`, `open-requests`, `proposals`) y las fundaciones cross-cutting (config por env, logging con correlation id, testing, etc.). Hoy parte del backend opera con almacenamiento in-memory en adaptadores de infraestructura, lo que no garantiza durabilidad ni permite validar consistentemente comportamiento E2E contra un esquema real.

Esta change implementa **persistencia real** alineada a las specs existentes:
- `typeorm-foundation`: DataSource único, env validation, migraciones como fuente de verdad, no ORM en `domain/` ni `application/`.
- `module-persistence-patterns` y `relational-domain-persistence`: puertos en `application`, entidades/mappers en `infrastructure`, modelado relacional explícito.

Restricciones clave:
- Configuración estricta por `ConfigModule/ConfigService` (fail-fast).
- No filtrar TypeORM hacia `domain/` ni `application/`.
- Tests unitarios sin DB; E2E con DB determinística y migraciones.
- Logging estándar (Nest Logger) y correlación cuando aplique.

## Goals / Non-Goals

**Goals:**
- Proveer persistencia real para todos los módulos con datos durables y esquema versionado por migraciones.
- Implementar adaptadores TypeORM que cumplan los puertos existentes (o introducir puertos faltantes donde corresponda).
- Mantener DDD estricto: `domain` puro, `application` orquesta vía puertos, `infrastructure` contiene entidades/mappers/adaptadores.
- E2E determinísticos: DB de test limpia + migraciones aplicadas automáticamente en el setup.

**Non-Goals:**
- Cambiar el contrato funcional de los endpoints (paths, DTOs, status codes) definido por las specs del MVP.
- Optimización avanzada de performance/índices o modelado completo más allá de lo mínimo necesario para persistir el comportamiento actual.
- Implementar comunicación interna entre módulos vía HTTP (se mantiene el enfoque event-driven para integraciones internas; fuera de alcance aquí).

## Decisions

### DB relacional + TypeORM como implementación estándar
- **Decisión**: usar TypeORM con un `DataSource` único por proceso y migraciones para el esquema.
- **Racional**: ya existe fundación (`typeorm-foundation`) y mantiene separación de capas.
- **Alternativas consideradas**:
  - Prisma: descartado por desviarse del foundation actual.
  - SQLite file/in-memory para runtime: útil para tests, pero no como target principal de persistencia real.

### Entidades persistentes y mappers confinados a `infrastructure/`
- **Decisión**: cada módulo define sus entidades TypeORM dentro de `apps/api/src/modules/<module>/infrastructure/**` junto con mappers dominio↔persistencia y adaptadores de repositorio.
- **Racional**: evita imports ORM fuera de infraestructura y permite evolucionar el dominio sin acoplarlo al esquema.

### Wiring por ambiente: in-memory sólo para tests/unit, DB para runtime
- **Decisión**: los providers por defecto del módulo apuntan a adaptadores DB; los adaptadores in-memory se reservan para unit tests (mocks) o escenarios explícitos de test.
- **Racional**: la change existe para asegurar durabilidad y realismo en E2E/CI.

### Migraciones como única fuente de verdad del esquema
- **Decisión**: `synchronize` deshabilitado; creación/evolución del esquema mediante migraciones TypeORM.
- **Racional**: consistencia entre ambientes y despliegues; trazabilidad del esquema.

### Setup de E2E con DB determinística
- **Decisión**: en E2E, aplicar migraciones al inicio (una vez por suite o por archivo, según costo) y limpiar estado entre tests de manera determinística (truncate por tablas en orden seguro o recreación del schema).
- **Racional**: elimina flakiness por estado compartido y asegura repetibilidad.
- **Alternativas consideradas**:
  - Testcontainers: excelente aislamiento, pero puede ser más pesado; queda como opción si el repo ya lo usa.
  - Reutilizar una DB compartida sin limpieza estricta: descartado por no determinista.

## Risks / Trade-offs

- **[Riesgo]** Dificultad para definir un esquema mínimo coherente si el dominio aún es muy “MVP” → **Mitigación**: empezar por tablas mínimas que soporten los endpoints actuales y refinar con migraciones incrementales.
- **[Riesgo]** E2E lentos por migraciones/limpieza → **Mitigación**: aplicar migraciones una vez por suite y truncar entre tests; evitar seeds grandes.
- **[Riesgo]** Acoplamiento accidental de `application/` a modelos de persistencia → **Mitigación**: revisión estricta de imports y uso obligatorio de puertos + mappers en infraestructura.
- **[Riesgo]** Diferencias dev/prod (config, SSL, credenciales) → **Mitigación**: todo por env + validación fail-fast; documentar `.env.example`.

## Migration Plan

- Introducir/ajustar `PersistenceModule` compartido para registrar `DataSource` y utilidades de migración.
- Agregar migraciones iniciales por módulo (o agrupadas) para crear tablas y constraints mínimas.
- Actualizar módulos para usar adaptadores DB como default (manteniendo in-memory sólo para unit tests).
- Actualizar setup de Jest/E2E para:
  - inicializar DataSource de test,
  - correr migraciones,
  - limpiar estado entre tests.
- Rollback:
  - revertir wiring a in-memory (temporal) y/o revertir migraciones aplicadas (si la estrategia de despliegue lo requiere).

## Open Questions

- DB objetivo para dev/test: ¿Postgres vía `docker-compose` del repo, o ya existe infraestructura de test (containers/compose) que debamos reutilizar?
- Estrategia de limpieza E2E: truncate por tablas vs recrear schema por suite (según volumen de tablas y constraints).
- Nivel de auditoría/metadata técnica (p. ej. tabla `app_meta`): ¿se mantiene como base para health/probes y versionado?
