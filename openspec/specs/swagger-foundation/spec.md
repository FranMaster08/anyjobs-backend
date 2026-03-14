## Purpose

Definir el estándar de documentación Swagger por endpoint y su desacople del controller.

## Requirements

### Requirement: Swagger obligatorio por endpoint
Cada endpoint nuevo o modificado MUST tener documentación Swagger completa en el mismo cambio (request, responses 2xx/4xx/5xx y DTOs con descripción y ejemplos).

#### Scenario: Endpoint creado o modificado
- **WHEN** se agrega o modifica un endpoint
- **THEN** existe documentación Swagger actualizada que refleja su request/response y errores posibles

### Requirement: Swagger desacoplado del controller
La documentación Swagger MUST vivir en `apps/api/src/modules/<module>/api/swagger/` y el controller MUST aplicar un único decorador “composite” importado desde esa carpeta, evitando decoradores extensos inline en el controller.

#### Scenario: Controller limpio
- **WHEN** se inspecciona un controller de un módulo
- **THEN** el controller no contiene decoradores Swagger extensos y solo importa/aplica el decorador compuesto del endpoint

### Requirement: DTOs documentados con descripción y ejemplo
Todo DTO expuesto por la API MUST incluir por propiedad: descripción y ejemplo, y MUST documentar opcionalidad/restricciones cuando aplique.

#### Scenario: DTO con campos requeridos y opcionales
- **WHEN** se genera el Swagger para un endpoint
- **THEN** las propiedades del DTO muestran descripción y ejemplo y reflejan correctamente campos requeridos/opcionales

