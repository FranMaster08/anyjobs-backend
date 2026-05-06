## ADDED Requirements

### Requirement: Storage provider abstraction for request images
El sistema MUST resolver el almacenamiento de imágenes mediante un contrato abstracto (`ImageStorageProvider` o equivalente) desacoplado del proveedor físico.

La implementación del dominio MUST depender del contrato y no de detalles de filesystem, SDK cloud o rutas hardcodeadas.

#### Scenario: Service stores image through abstraction
- **WHEN** el backend procesa una imagen válida para una propuesta
- **THEN** la operación de guardado se ejecuta a través del contrato de storage y retorna un identificador o metadata utilizable por persistencia

### Requirement: Local storage provider as initial implementation
El sistema MUST incluir una implementación local para ambientes actuales sin bucket cloud definido.

La implementación local MUST persistir archivos de forma estable y recuperable por el backend para visualización posterior.

#### Scenario: Local provider persists uploaded file
- **WHEN** se invoca el provider local con un archivo válido
- **THEN** el archivo queda almacenado en el servidor y el provider devuelve la referencia necesaria para construir URL de visualización

### Requirement: Stable image URL generation
El sistema MUST generar una URL de visualización para cada imagen asociada a propuesta y exponerla en endpoints GET pertinentes.

La generación de URL MUST depender del provider para permitir reemplazo futuro por URLs cloud directas o firmadas.

#### Scenario: GET returns image URLs
- **WHEN** un cliente autorizado consulta una propuesta con imágenes
- **THEN** la respuesta incluye URLs de visualización de cada imagen según el provider activo
