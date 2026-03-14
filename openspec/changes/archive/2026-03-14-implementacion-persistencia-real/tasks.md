## 1. Fundaciones de persistencia y configuración

- [x] 1.1 Revisar/ajustar `DB_*` en `.env.example` y validación fail-fast en `apps/api/src/config/env.validation.ts`
- [x] 1.2 Consolidar `apps/api/src/shared/persistence/*` (DataSource, options, logger TypeORM, módulo de persistencia) y asegurar que sólo `config/*` lea `process.env`
- [x] 1.3 Agregar/ajustar scripts de migraciones y utilidades de DB para dev/test (run/revert/show) en `package.json`

## 2. Esquema y migraciones (baseline)

- [x] 2.1 Definir el esquema mínimo por módulo (tablas, columnas, constraints) necesario para los endpoints actuales
- [x] 2.2 Crear migraciones iniciales (o completar las existentes) para `auth`, `user-profile`, `site-config`, `open-requests`, `proposals` (incluyendo índices/relaciones donde aplique)
- [x] 2.3 Verificar que correr migraciones sobre DB vacía deja la app arrancable (sin errores por tablas/columnas faltantes)
- [x] 2.4 Estandarizar IDs como UUID en el baseline (tablas + seeds determinísticos)

## 3. Implementación de persistencia por módulo (TypeORM)

- [x] 3.1 `auth`: crear entidades TypeORM + mappers y adaptadores DB que implementen los puertos (reemplazar wiring in-memory en runtime)
- [x] 3.2 `user-profile`: crear entidades TypeORM + mappers y adaptadores DB para persistir actualizaciones de perfil
- [x] 3.3 `site-config`: crear entidad TypeORM y adaptador DB para lectura de configuración del sitio
- [x] 3.4 `open-requests`: crear entidades TypeORM + adaptador DB para list/detail (incluye orden determinístico para paginación)
- [x] 3.5 `proposals`: crear entidades TypeORM + adaptador DB para create y list con filtros
- [x] 3.6 `health`: implementar `HealthDbProbePort` con un adaptador DB basado en `DataSource`
- [x] 3.7 Asegurar reconstrucción de payloads complejos (JSON serializado) al leer desde DB (compat `postgres`/`sqljs`)

## 4. Wiring y aislamiento por ambiente

- [x] 4.1 Configurar providers por defecto para que runtime use adaptadores DB (in-memory sólo para unit tests o escenarios de test explícitos)
- [x] 4.2 Verificar que `domain/` y `application/` no importen TypeORM (revisión por imports) y que controllers no accedan a persistencia directa

## 5. Testing (E2E determinísticos con DB)

- [x] 5.1 Configurar E2E para DB determinística usando `sqljs` `:memory:` con `DB_MIGRATIONS_RUN=true`
- [x] 5.2 Asegurar aislamiento por suite mediante DB in-memory (sin estado persistente entre suites)
- [x] 5.3 Mantener seeds mínimos en migración baseline para módulos de lectura (open-requests, site-config)
- [x] 5.4 Ajustar E2E existentes para que obtengan IDs reales (UUID) desde endpoints (no hardcodear IDs “de demo”)

## 6. Observabilidad y documentación operativa

- [x] 6.1 Asegurar logging estándar en operaciones DB (niveles, sin secretos) y correlación cuando exista contexto de request
- [x] 6.2 Actualizar `README.md` con requisitos de DB para levantar el API y ejecutar E2E, y documentar el flujo de migraciones
