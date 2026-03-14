## 1. Fundaciones de persistencia y configuración

- [ ] 1.1 Revisar/ajustar `DB_*` en `.env.example` y validación fail-fast en `apps/api/src/config/env.validation.ts`
- [ ] 1.2 Consolidar `apps/api/src/shared/persistence/*` (DataSource, options, logger TypeORM, módulo de persistencia) y asegurar que sólo `config/*` lea `process.env`
- [ ] 1.3 Agregar/ajustar scripts de migraciones y utilidades de DB para dev/test (run/revert/show) en `package.json`

## 2. Esquema y migraciones (baseline)

- [ ] 2.1 Definir el esquema mínimo por módulo (tablas, columnas, constraints) necesario para los endpoints actuales
- [ ] 2.2 Crear migraciones iniciales (o completar las existentes) para `auth`, `user-profile`, `site-config`, `open-requests`, `proposals` (incluyendo índices/relaciones donde aplique)
- [ ] 2.3 Verificar que correr migraciones sobre DB vacía deja la app arrancable (sin errores por tablas/columnas faltantes)

## 3. Implementación de persistencia por módulo (TypeORM)

- [ ] 3.1 `auth`: crear entidades TypeORM + mappers y adaptadores DB que implementen los puertos (reemplazar wiring in-memory en runtime)
- [ ] 3.2 `user-profile`: crear entidades TypeORM + mappers y adaptadores DB para persistir actualizaciones de perfil
- [ ] 3.3 `site-config`: crear entidad TypeORM y adaptador DB para lectura de configuración del sitio
- [ ] 3.4 `open-requests`: crear entidades TypeORM + adaptador DB para list/detail (incluye orden determinístico para paginación)
- [ ] 3.5 `proposals`: crear entidades TypeORM + adaptador DB para create y list con filtros
- [ ] 3.6 `health`: implementar `HealthDbProbePort` con un adaptador DB basado en `DataSource`

## 4. Wiring y aislamiento por ambiente

- [ ] 4.1 Configurar providers por defecto para que runtime use adaptadores DB (in-memory sólo para unit tests o escenarios de test explícitos)
- [ ] 4.2 Verificar que `domain/` y `application/` no importen TypeORM (revisión por imports) y que controllers no accedan a persistencia directa

## 5. Testing (E2E determinísticos con DB)

- [ ] 5.1 Implementar setup global de E2E: inicializar DataSource de test y correr migraciones antes de la suite
- [ ] 5.2 Implementar estrategia de limpieza determinística entre tests/suites (truncate seguro o recreación controlada)
- [ ] 5.3 Actualizar/crear fixtures para poblar DB de test de forma mínima y repetible
- [ ] 5.4 Ajustar E2E existentes para que pasen con persistencia real y validar escenarios críticos

## 6. Observabilidad y documentación operativa

- [ ] 6.1 Asegurar logging estándar en operaciones DB (niveles, sin secretos) y correlación cuando exista contexto de request
- [ ] 6.2 Actualizar `README.md` con requisitos de DB para levantar el API y ejecutar E2E, y documentar el flujo de migraciones
