## ADDED Requirements

### Requirement: Swagger UI MUST permitir autorizacion Bearer en desarrollo
Cuando Swagger este habilitado y la aplicacion corra en desarrollo con la configuracion de auth interactiva activada, el sistema MUST exponer en Swagger UI un esquema de seguridad Bearer que permita cargar manualmente un token y reutilizarlo en requests a endpoints protegidos.

#### Scenario: Swagger UI muestra autorizacion interactiva en desarrollo
- **WHEN** la aplicacion se inicia con Swagger habilitado, `NODE_ENV=development` y la configuracion de auth interactiva de Swagger activada
- **THEN** Swagger UI muestra la opcion `Authorize` para autenticacion Bearer y permite enviar el token en requests posteriores a endpoints protegidos

### Requirement: Swagger UI MUST soportar el flujo manual de login mas autorizacion
El sistema MUST permitir que un usuario de desarrollo ejecute el endpoint de login documentado en Swagger, obtenga un token desde la respuesta y luego lo ingrese manualmente en `Authorize` con el formato `Bearer <token>` para probar endpoints protegidos desde la misma interfaz.

#### Scenario: Reutilizacion manual del token devuelto por login
- **WHEN** un desarrollador ejecuta `POST /auth/login` desde Swagger UI con credenciales validas y luego carga el valor `Bearer <token>` en `Authorize`
- **THEN** las siguientes requests realizadas desde Swagger UI a endpoints protegidos incluyen el token y pueden ser evaluadas normalmente por los guards existentes

### Requirement: Swagger UI MUST restringir la auth interactiva fuera de desarrollo
El sistema MUST NOT habilitar la autorizacion interactiva de Swagger UI cuando la aplicacion no este corriendo en desarrollo o cuando la configuracion de auth interactiva de Swagger este desactivada, incluso si Swagger permanece expuesto para documentacion.

#### Scenario: Auth interactiva deshabilitada fuera de desarrollo
- **WHEN** la aplicacion se inicia con `NODE_ENV` distinto de `development` o con la configuracion de auth interactiva de Swagger desactivada
- **THEN** Swagger UI no expone la funcionalidad de autorizacion interactiva para endpoints protegidos
