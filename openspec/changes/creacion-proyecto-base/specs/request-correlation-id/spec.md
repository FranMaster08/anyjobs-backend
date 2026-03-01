## ADDED Requirements

### Requirement: Correlation ID siempre disponible por request
Para cada request HTTP entrante, el sistema MUST tener un `correlationId` disponible durante todo el ciclo de vida del request.

#### Scenario: Request sin header de correlation id
- **WHEN** llega un request sin el header `x-correlation-id`
- **THEN** el sistema genera un `correlationId` y lo asocia al contexto del request

#### Scenario: Request con header de correlation id
- **WHEN** llega un request con el header `x-correlation-id`
- **THEN** el sistema utiliza ese valor como `correlationId` durante el manejo del request

### Requirement: Propagación del correlation id a logs y respuestas de error
El `correlationId` MUST propagarse a todos los logs generados durante el request y MUST incluirse en toda respuesta de error bajo el contrato estándar de errores.

#### Scenario: Error no controlado durante un request
- **WHEN** ocurre un error inesperado que termina en una respuesta 5xx
- **THEN** la respuesta incluye `correlationId` y los logs asociados al request incluyen el mismo `correlationId`

### Requirement: Header de salida opcional y consistente
Si la API expone el correlation id como header de respuesta, MUST usar un header consistente (por ejemplo `x-correlation-id`) y MUST coincidir con el `correlationId` utilizado internamente.

#### Scenario: Respuesta exitosa con header de correlation id
- **WHEN** una petición finaliza exitosamente y el sistema está configurado para devolver correlation id en headers
- **THEN** la respuesta incluye `x-correlation-id` con el mismo valor usado en logs y en el contexto del request

