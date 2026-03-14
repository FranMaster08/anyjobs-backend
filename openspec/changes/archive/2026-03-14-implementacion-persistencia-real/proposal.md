## Why

Hoy la API puede funcionar con adaptadores in-memory (especialmente en `auth` y flujos asociados), lo que impide tener datos persistentes entre ejecuciones y limita la confiabilidad de pruebas E2E/CI. Necesitamos persistencia real para poder evolucionar el producto sobre una base consistente (migraciones, datos durables, queries determinísticas) y validar el comportamiento extremo-a-extremo contra una DB.

## What Changes

- Implementar persistencia real (TypeORM + migraciones) para **todos los módulos** que manejan datos: `auth`, `user-profile`, `site-config`, `open-requests`, `proposals` y `health` (probe de DB).
- Crear entidades TypeORM por módulo y sus mappers dominio ↔ persistencia en `infrastructure/` (sin filtrar ORM a `domain/` ni `application/`).
- Crear adaptadores concretos de repositorio/almacenamiento que implementen los puertos en `application/ports/*` y reemplazar el wiring in-memory por wiring DB en runtime.
- Estandarizar IDs persistidos como **UUID** (incluyendo seeds determinísticos para fixtures de E2E).
- Estandarizar el setup de DB de test (aplicar migraciones, limpiar estado) para que los E2E sean determinísticos.
- **BREAKING**: la ejecución local/E2E pasa a requerir configuración `DB_*` válida y una base de datos disponible (o una alternativa determinística definida para test) para validar persistencia real.

## Capabilities

### New Capabilities

- `persistence-real`: Persistencia real por módulo usando TypeORM (entidades, adaptadores, migraciones, wiring por env) y pruebas E2E corriendo contra una DB determinística.

### Modified Capabilities

<!-- Ninguna por ahora: el contrato funcional de endpoints no cambia; se implementa la persistencia detrás de los puertos existentes. -->

## Impact

- Código afectado:
  - `apps/api/src/shared/persistence/*` (foundation TypeORM, datasource/options, logger, migraciones)
  - `apps/api/src/modules/*/application/ports/*` (puertos necesarios para persistencia)
  - `apps/api/src/modules/*/infrastructure/adapters/*` (repositorios DB, mappers, entidades TypeORM)
  - `apps/api/src/modules/*/*.module.ts` (wiring por DI)
  - `apps/api/test/e2e/*` y setup de Jest (DB de test + migraciones)
- Config/ops:
  - `.env.example` y validación `env.validation.ts` para `DB_*` (fail-fast)
  - Dependencias de TypeORM/driver y scripts de migración/seed si aplica
