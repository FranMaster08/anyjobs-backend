## Why

Actualmente Swagger documenta correctamente la API, pero no permite autenticarse desde su interfaz para probar endpoints protegidos durante el desarrollo local y con Docker. Este cambio busca habilitar esa capacidad solo en entornos de desarrollo para mejorar la validacion manual de endpoints sin alterar contratos, controllers ni permisos de la aplicacion.

## What Changes

- Habilitar en Swagger UI el flujo de autenticacion necesario para enviar credenciales y reutilizar el token en requests a endpoints protegidos.
- Restringir esta capacidad a ejecuciones locales y de desarrollo con Docker, evitando habilitarla en otros entornos.
- Ajustar unicamente la configuracion y documentacion de Swagger asociada a autenticacion, sin modificar controllers, modulos, guards, permisos ni contratos HTTP existentes.

## Capabilities

### New Capabilities

- `swagger-ui-auth-dev`: Permite autenticarse desde la interfaz grafica de Swagger y reutilizar el token en requests protegidos solo en desarrollo local y Docker.

### Modified Capabilities

- `swagger-foundation`: Extiende los requisitos de Swagger para contemplar autenticacion interactiva en Swagger UI con restriccion explicita por entorno de desarrollo.

## Impact

- Configuracion de Swagger en `apps/api` para definir el esquema de seguridad y su exposicion condicional por entorno.
- Configuracion por variables de entorno y documentacion operativa necesaria para desarrollo local y Docker.
- Sin impacto en endpoints existentes, controllers, modulos, RBAC ni contratos funcionales de autenticacion.

