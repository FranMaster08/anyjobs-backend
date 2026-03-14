## ADDED Requirements

### Requirement: Configuración de DB por variables de entorno (fail-fast)
La aplicación MUST obtener toda configuración de base de datos mediante el `ConfigModule/ConfigService` central y MUST validar presencia y tipo de las variables `DB_*` antes de iniciar. Si falta una variable requerida o es inválida, la app MUST finalizar y MUST NOT quedar escuchando el puerto HTTP.

#### Scenario: Variable requerida faltante
- **WHEN** la app inicia sin definir una variable requerida `DB_*` (por ejemplo `DB_HOST`)
- **THEN** la app falla al inicio (fail-fast) y no levanta el servidor HTTP

### Requirement: Integración TypeORM como fundación de persistencia
La aplicación MUST registrar TypeORM para proveer un `DataSource` único (por proceso) y permitir que la infraestructura consuma repositorios/manager sin exponer TypeORM a `domain/` ni a `application/`.

#### Scenario: Infraestructura requiere acceso a DataSource
- **WHEN** un adaptador concreto en `infrastructure/` necesita ejecutar una operación de persistencia
- **THEN** obtiene `DataSource`/repositorios a través de providers de Nest (DI) sin que `domain/` ni `application/` importen TypeORM

### Requirement: Prohibición de dependencias ORM en domain y application
El código en `domain/` MUST NOT importar TypeORM ni decoradores ORM. El código en `application/` MUST NOT depender de entidades TypeORM ni de APIs de persistencia; sólo depende de `domain/` y de puertos en `application/ports/*`.

#### Scenario: Revisión de imports por capa
- **WHEN** se revisan los imports de archivos en `domain/` y `application/`
- **THEN** no existen imports desde `typeorm` ni `@nestjs/typeorm` en esas capas

### Requirement: Migraciones como única fuente de verdad del esquema
La evolución del esquema MUST realizarse mediante migraciones. La sincronización automática del esquema (`synchronize`) MUST estar deshabilitada por defecto y MUST NOT usarse en producción.

#### Scenario: Arranque en producción
- **WHEN** la aplicación corre con `NODE_ENV=production`
- **THEN** `synchronize` está deshabilitado y el esquema se asume gestionado por migraciones

### Requirement: Conectividad y seguridad por ambiente
La fundación de persistencia MUST soportar configuración por ambiente para host/puerto/credenciales/base, y MUST permitir habilitar SSL por env cuando aplique. Credenciales y secretos MUST NOT hardcodearse.

#### Scenario: Conexión con SSL habilitado
- **WHEN** el ambiente requiere conexión TLS a la base de datos y se habilita la opción por env
- **THEN** la app establece conexión usando SSL sin cambiar código

### Requirement: Observabilidad mínima de operaciones de base de datos
La integración de persistencia MUST loguear fallas de conexión y errores relevantes de DB usando el logger estándar (niveles), y MUST incluir `correlationId` cuando exista contexto de request. No debe loguear secretos ni credenciales.

#### Scenario: Error de conexión a DB
- **WHEN** falla la conexión a la base de datos al iniciar o durante una operación
- **THEN** se registra un log de nivel `error` con contexto suficiente y `correlationId` si está disponible, sin exponer secretos

