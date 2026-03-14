## ADDED Requirements

### Requirement: Persistencia real por módulo vía puertos y adaptadores DB
El sistema MUST persistir datos de los módulos del MVP mediante adaptadores concretos de base de datos que implementen puertos en `application/ports/*`. Los controllers MUST delegar en casos de uso y los casos de uso MUST usar exclusivamente puertos (sin dependencias a ORM).

#### Scenario: Caso de uso persiste usando un puerto
- **WHEN** un caso de uso necesita leer o escribir datos de un módulo (por ejemplo registrar usuario, actualizar perfil, crear propuesta)
- **THEN** la operación se realiza a través de un puerto de `application/ports/*` implementado por un adaptador DB en `infrastructure/`

### Requirement: Entidades TypeORM y mappers confinados a infraestructura por módulo
El sistema MUST definir entidades TypeORM (`@Entity`) y mappers dominio↔persistencia dentro de `infrastructure/` de cada módulo y MUST NOT filtrar esos tipos hacia `domain/` ni `application/`.

#### Scenario: Revisión de dependencias por capa
- **WHEN** se inspeccionan imports en `domain/` y `application/` de un módulo
- **THEN** no existen imports desde `typeorm` ni referencias a entidades TypeORM del módulo

### Requirement: Wiring por ambiente usa DB por defecto; in-memory sólo para pruebas
El sistema MUST usar adaptadores DB como wiring por defecto para runtime. Los adaptadores in-memory (si existen) MUST ser utilizables únicamente para pruebas unitarias o escenarios de test explícitos.

#### Scenario: Runtime no usa persistencia in-memory
- **WHEN** la aplicación inicia en un ambiente de runtime (por ejemplo `NODE_ENV=development|production`)
- **THEN** los providers de persistencia resuelven a adaptadores DB y no a implementaciones in-memory

### Requirement: Migraciones crean el esquema requerido para módulos del MVP
El sistema MUST proveer migraciones que creen el esquema mínimo necesario para persistir los datos requeridos por los endpoints de los módulos del MVP.

#### Scenario: DB vacía queda lista con migraciones
- **WHEN** se ejecutan migraciones sobre una base de datos vacía
- **THEN** el esquema resultante permite iniciar la app y ejecutar operaciones de persistencia de los módulos sin errores de “tabla/columna inexistente”

### Requirement: IDs persistidos son UUID
El sistema MUST usar UUID como tipo de identificador persistido para los recursos principales (por ejemplo usuarios, open requests, site config, proposals y registration flows) y MUST evitar IDs “de demo” en el runtime (ej. `req-1`, `default`).

#### Scenario: Recursos persistidos tienen ID UUID
- **WHEN** se inspeccionan las migraciones y entidades TypeORM del baseline
- **THEN** las columnas de identificación primaria usan tipo UUID y los seeds/fixtures usan UUIDs determinísticos

### Requirement: E2E contra DB determinística con migraciones aplicadas
Los E2E MUST ejecutarse contra una base de datos de test determinística. Antes de validar endpoints, el esquema MUST estar listo mediante migraciones y el estado MUST limpiarse de forma determinística entre tests o suites.

#### Scenario: Suite E2E es repetible
- **WHEN** se ejecuta la suite E2E dos veces seguidas en el mismo entorno
- **THEN** los resultados son consistentes y no dependen del orden ni de estado sucio residual en DB

### Requirement: Persistencia portable de payloads complejos (JSON)
Cuando un módulo requiera persistir payloads complejos (objetos/arrays), el sistema MUST persistirlos de forma portable entre los drivers soportados (por ejemplo `postgres` y `sqljs`) y MUST reconstruir el shape requerido por los endpoints al leer.

#### Scenario: Lectura reconstruye arrays/objetos
- **WHEN** el backend lee registros que contienen campos JSON persistidos (por ejemplo `images`, `provider`, `sections`)
- **THEN** el endpoint retorna arrays/objetos con el shape esperado (por ejemplo `images` es siempre un array)

### Requirement: Health incluye probe de conectividad a DB
El sistema MUST exponer un probe de DB en el módulo `health` que valide conectividad real contra la base de datos usada por el runtime.

#### Scenario: Health detecta DB no disponible
- **WHEN** la base de datos no es alcanzable o falla una operación simple de conectividad
- **THEN** el probe reporta estado no saludable (unhealthy) de forma consistente
