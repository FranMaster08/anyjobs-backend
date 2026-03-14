## 1. Dependencias y configuración por env

- [x] 1.1 Agregar dependencias `typeorm`, `@nestjs/typeorm` y driver `pg` (y actualizar lockfile)
- [x] 1.2 Extender `.env.example` con variables `DB_*` mínimas (host/port/user/password/database/ssl) y toggles de runtime (migrations/synchronize/logging)
- [x] 1.3 Actualizar `apps/api/src/config/env.validation.ts` para validar `DB_*` (tipos/rangos) y fallar fail-fast
- [x] 1.4 Actualizar `apps/api/src/config/configuration.ts` para mapear `DB_*` a una sección `database.*` tipada consumible por `ConfigService`

## 2. Fundación TypeORM (wiring Nest + DataSource)

- [x] 2.1 Crear módulo compartido de persistencia (por ejemplo `apps/api/src/shared/persistence/`) con `PersistenceModule`
- [x] 2.2 Implementar factory/provider de configuración TypeORM usando `ConfigService` (sin leer `process.env` fuera de `config/`)
- [x] 2.3 Registrar TypeORM globalmente en la app (import en `AppModule`) sin filtrar TypeORM hacia `domain/` o `application/`
- [x] 2.4 Definir convenciones de ubicación de entidades TypeORM y repositorios concretos por módulo en `infrastructure/`

## 3. Migraciones

- [x] 3.1 Definir estructura de migraciones (carpeta) y estrategia de nombres/orden
- [x] 3.2 Agregar scripts npm para `migration:generate`, `migration:run` y `migration:revert`
- [x] 3.3 Asegurar que `synchronize` esté deshabilitado por defecto y esté prohibido en `NODE_ENV=production`
- [x] 3.4 Definir política de `DB_MIGRATIONS_RUN` (si corre en runtime) y documentar su uso por ambiente

## 4. Logging y correlationId en DB

- [x] 4.1 Implementar logger de TypeORM que delegue a `Logger` de Nest (niveles) y sanitice output (sin secretos)
- [x] 4.2 Integrar `correlationId` en logs de DB cuando exista contexto de request (sin romper ejecución fuera de request)
- [x] 4.3 Definir política de verbosidad (respetar `LOG_LEVEL`/`LOG_DEBUG_PAYLOADS`) para queries/errores de DB

## 5. Patrón por módulo (DDD) y ejemplo mínimo

- [x] 5.1 Definir plantilla de puerto de repositorio en `application/ports/*` (barrel exports si corresponde)
- [x] 5.2 Definir plantilla de adaptador TypeORM en `infrastructure/` que implemente el puerto y mapee dominio↔persistencia
- [x] 5.3 Agregar un ejemplo mínimo en un módulo existente (sin cambiar contratos HTTP) que demuestre el patrón end-to-end dentro del módulo (puerto + adapter + wiring DI)
- [x] 5.4 Verificar por lints/imports que `domain/` y `application/` no importan TypeORM

## 6. Tests (unit y E2E determinísticos)

- [x] 6.1 Mantener unit tests usando mocks de puertos (sin inicializar TypeORM)
- [x] 6.2 Preparar estrategia E2E con DB de test repetible (preferible Postgres) y setup/teardown determinístico
- [x] 6.3 Ejecutar migraciones antes de correr E2E y asegurar que la suite no depende de orden de ejecución
- [x] 6.4 Agregar al menos una verificación E2E mínima de “boot con DB” (arranque + health) para validar configuración/migraciones

## 7. Documentación operativa

- [x] 7.1 Documentar variables `DB_*` y el flujo de migraciones en `README.md` (cómo levantar en dev y cómo correr migraciones)
- [x] 7.2 Documentar cómo habilitar logs de DB de forma segura (sin secretos) y cómo se propaga `correlationId`

