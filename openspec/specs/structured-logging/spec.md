## Purpose

Estandarizar el logging del backend (NestJS Logger, niveles, correlationId y sanitización).

## Requirements

### Requirement: Prohibido usar console.log
El código del backend MUST NOT usar `console.log` (ni variantes) para logging de aplicación.

#### Scenario: Revisión de cambios en un PR
- **WHEN** se revisa un PR que agrega o modifica código
- **THEN** no existen invocaciones a `console.log` en controllers, application, infrastructure ni servicios relevantes

### Requirement: Logging con NestJS Logger y niveles
Controllers, casos de uso (application), adaptadores de infraestructura y servicios relevantes MUST loguear usando NestJS `Logger` (o un wrapper que delegue 1:1) y MUST respetar niveles (`debug`, `log`, `warn`, `error`) configurables por variables de entorno.

#### Scenario: LOG_LEVEL=warn
- **WHEN** el sistema está configurado con `LOG_LEVEL=warn`
- **THEN** los logs `debug` y `log` no se emiten y los `warn/error` sí se emiten

### Requirement: Contexto real del origen (caller) en cada log
Cada log MUST indicar el contexto real del origen (clase/método o equivalente) y MUST incluir `correlationId`.

#### Scenario: Logging desde un caso de uso
- **WHEN** un caso de uso loguea un evento en nivel `log`
- **THEN** el log contiene el contexto del caso de uso (no un logger genérico) y contiene `correlationId`

### Requirement: Sanitización obligatoria de payloads
El sistema MUST sanitizar/redactar campos sensibles antes de loguear payloads o metadata (por ejemplo: `authorization`, `cookie`, `set-cookie`, `token`, `password`, `secret`, `apiKey`, `client_secret`, `refresh_token`, `otp`, `pin`). Si `LOG_DEBUG_PAYLOADS=false`, el sistema MUST NOT loguear payloads completos.

#### Scenario: Debug payloads desactivado
- **WHEN** `LOG_DEBUG_PAYLOADS=false` y llega un request con body y headers
- **THEN** los logs no incluyen el payload completo y cualquier snapshot logueado aparece redactado

