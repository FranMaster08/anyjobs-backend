## Purpose

Establecer un contrato único de error para el cliente y logging técnico completo con `correlationId` para el backend.

## Requirements

### Requirement: Contrato único de error hacia el cliente
Toda respuesta de error HTTP MUST cumplir el siguiente contrato:
- `status`: number
- `errorCode`: string
- `message`: string
- `technicalMessage`: string
- `correlationId`: string
- `timestamp`: string (ISO 8601)
- `details?`: object | array (solo para validación u otros casos aprobados)

#### Scenario: Error de validación
- **WHEN** un request falla validación de inputs
- **THEN** la respuesta incluye el contrato estándar y `details` describe los campos inválidos sin exponer secretos

### Requirement: Prohibido filtrar detalles técnicos al cliente
El backend MUST NOT retornar al cliente stack traces, queries SQL, nombres internos de tablas, paths, tokens, secretos, dumps de objetos o payloads crudos en ninguna respuesta de error.

#### Scenario: Excepción inesperada
- **WHEN** ocurre una excepción no controlada
- **THEN** el cliente recibe un mensaje estable y no sensible y NO recibe stack traces ni detalles internos

### Requirement: Catálogo central de errores (errorCode) obligatorio
Todo error retornado al cliente MUST mapearse a una entrada en un catálogo central de errores (por ejemplo `INTERNAL.UNEXPECTED`, `AUTH.UNAUTHORIZED`, `VALIDATION.INVALID_INPUT`, etc.) y el `errorCode` MUST venir de ese catálogo.

#### Scenario: Error no mapeado explícitamente
- **WHEN** ocurre un error que no tiene mapeo específico
- **THEN** el sistema responde con `errorCode` del catálogo para inesperados (por ejemplo `INTERNAL.UNEXPECTED`)

### Requirement: Logging técnico completo con correlation id
Todo error MUST loguearse internamente incluyendo: `correlationId`, `errorCode`, `httpStatus`, stack trace completo y contexto (controller/handler/route/method). Los payloads logueados MUST ser sanitizados.

#### Scenario: Error 5xx con stack trace
- **WHEN** ocurre un error que termina en 500
- **THEN** el sistema emite un log `error` con stack trace completo y `correlationId`, y la respuesta al cliente mantiene el contrato estándar

