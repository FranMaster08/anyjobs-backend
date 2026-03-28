## Context

La aplicacion ya monta Swagger de forma centralizada en `apps/api/src/main.ts`, controlada por configuracion (`swagger.enabled` y `swagger.path`). Hoy el documento no define un esquema de seguridad global para JWT/Bearer y las operaciones protegidas no exponen en Swagger la metadata necesaria para reutilizar un token desde la UI.

El cambio tiene dos restricciones fuertes:
- solo debe afectar Swagger y su configuracion asociada;
- no debe modificar endpoints, contratos HTTP, permisos, guards, modulos ni controllers.

Ademas, el endpoint actual de login retorna un payload propio (`token` dentro del body) y no un flujo OAuth2 estandar. Por eso, sin cambiar contratos ni agregar una UI custom, la forma viable de "autenticarse desde Swagger" es ejecutar el login existente desde Swagger, copiar el token retornado y cargarlo en el boton `Authorize` para reutilizarlo en los endpoints protegidos.

## Goals / Non-Goals

**Goals:**
- Definir un esquema Bearer en Swagger para poder autorizar requests desde la UI.
- Hacer visible en Swagger que ciertos endpoints requieren autenticacion, sin mover decoradores al controller.
- Limitar esta capacidad a desarrollo local y Docker en modo desarrollo.
- Mantener el wiring centralizado en la configuracion de Swagger y por variables de entorno.

**Non-Goals:**
- Cambiar el contrato de `POST /auth/login` para convertirlo en OAuth2.
- Implementar auto-login, intercambio automatico de credenciales o plugins custom de Swagger UI.
- Modificar guards, RBAC, modulos, controllers o endpoints de negocio.
- Habilitar esta funcionalidad en produccion.

## Decisions

### 1. Usar autenticacion Bearer nativa de Swagger UI

Se agregara un esquema de seguridad Bearer en el `DocumentBuilder` central de Swagger. Esta opcion es compatible con el token JWT ya emitido por la API y no requiere cambios en auth.

Alternativas consideradas:
- OAuth2 password flow: descartado porque el endpoint actual de login no sigue ese contrato y requeriria cambiar request/response.
- Plugin custom de Swagger UI: descartado por agregar complejidad innecesaria y por salirse del alcance "solo Swagger".

### 2. Marcar endpoints protegidos desde los decoradores Swagger existentes

Los endpoints protegidos se anotaran con el requerimiento Bearer usando exclusivamente los archivos de `api/swagger/` ya existentes en cada modulo. Esto preserva el controller limpio y mantiene el desacople exigido por `swagger-foundation`.

Alternativas consideradas:
- Agregar decoradores en controllers: descartado porque rompe la restriccion del cambio y ensucia los controllers.
- Aplicar seguridad global a todas las operaciones: descartado porque marcaria como protegidos endpoints publicos como login, register o health publico.

### 3. Restringir la funcionalidad por entorno, con doble condicion

La UI de autorizacion en Swagger solo se habilitara cuando Swagger este habilitado y el entorno sea de desarrollo. El criterio debe combinar:
- `NODE_ENV=development`
- una bandera explicita de configuracion para auth interactiva en Swagger

La doble condicion evita habilitacion accidental en otros ambientes y permite controlar el comportamiento tanto en local como en Docker mediante variables de entorno.

Alternativas consideradas:
- Solo `NODE_ENV`: descartado porque no permite apagar la funcionalidad selectivamente.
- Solo flag custom: descartado porque deja abierta la posibilidad de activarla por error en ambientes no deseados.

### 4. Mantener el flujo operativo dentro de Swagger UI, pero manual en la carga del token

El flujo soportado sera:
1. ejecutar `POST /auth/login` desde Swagger;
2. copiar el `token` de la respuesta;
3. usar `Authorize` con `Bearer <token>` o el formato configurado por Swagger;
4. invocar endpoints protegidos desde la misma UI.

Esta decision cumple el objetivo de prueba manual desde Swagger sin tocar la API actual.

Alternativas consideradas:
- Inyectar automaticamente el token retornado por login en Swagger UI: descartado porque requiere personalizacion de frontend de Swagger o cambios de contrato.

## Risks / Trade-offs

- [Confusion sobre el alcance de "autenticarse desde Swagger"] -> Documentar claramente que el login ocurre en Swagger, pero la carga del token en `Authorize` es manual.
- [Activacion accidental fuera de desarrollo] -> Requerir validacion por env y chequear tambien `NODE_ENV`.
- [Endpoints protegidos sin metadata de seguridad en Swagger] -> Revisar y actualizar solo los decoradores compuestos de Swagger de endpoints protegidos.
- [Inconsistencia entre local y Docker] -> Documentar las nuevas variables en `.env.example` y en la configuracion usada por `docker-compose`.

## Migration Plan

1. Extender la configuracion tipada y la validacion de env para contemplar la bandera de auth interactiva de Swagger.
2. Ajustar el bootstrap de Swagger para registrar el esquema Bearer y habilitar la UI de autorizacion solo en desarrollo.
3. Agregar metadata Swagger de seguridad en los decoradores compuestos de endpoints protegidos.
4. Actualizar README/guia operativa de desarrollo si describe el uso de Swagger.
5. Verificar manualmente en local y Docker que login sigue funcionando, que `Authorize` aparece solo en desarrollo y que los endpoints protegidos aceptan el token cargado.

## Open Questions

- Definir el nombre exacto de la variable de entorno para habilitar auth interactiva en Swagger.
    AUTH_SWAGGER_ON
- Confirmar el formato esperado en la UI (`Bearer <token>` manual o token pelado con prefijo agregado automaticamente por Swagger) para documentarlo correctamente.
   SI ESE ES EL FOTMATO
