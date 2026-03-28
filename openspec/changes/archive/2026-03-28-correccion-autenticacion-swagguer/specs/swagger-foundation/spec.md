## MODIFIED Requirements

### Requirement: Swagger obligatorio por endpoint
Cada endpoint nuevo o modificado MUST tener documentacion Swagger completa en el mismo cambio (request, responses 2xx/4xx/5xx y DTOs con descripcion y ejemplos). Cuando un endpoint este protegido por autenticacion, su documentacion Swagger MUST declarar explicitamente el requerimiento de seguridad Bearer para que la operacion quede identificada como protegida en Swagger UI.

#### Scenario: Endpoint creado o modificado
- **WHEN** se agrega o modifica un endpoint
- **THEN** existe documentacion Swagger actualizada que refleja su request/response y errores posibles

#### Scenario: Endpoint protegido documentado en Swagger
- **WHEN** se genera el Swagger para un endpoint que requiere autenticacion previa
- **THEN** la operacion queda marcada con el requerimiento de seguridad Bearer y los endpoints publicos no reciben esa marca de seguridad por defecto
