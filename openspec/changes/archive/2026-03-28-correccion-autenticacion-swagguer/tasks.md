## 1. Configuracion por entorno

- [x] 1.1 Agregar la bandera `AUTH_SWAGGER_ON` al schema de configuracion y al objeto tipado de `swagger` sin leer `process.env` fuera de `apps/api/src/config`.
- [x] 1.2 Actualizar `.env.example` y la configuracion de `docker-compose` para documentar y propagar `AUTH_SWAGGER_ON` junto con las variables existentes de Swagger.
- [x] 1.3 Ajustar o agregar pruebas de validacion de env para cubrir el nuevo flag de autenticacion interactiva de Swagger.

## 2. Wiring central de Swagger

- [x] 2.1 Actualizar `apps/api/src/main.ts` para registrar un esquema de seguridad Bearer en Swagger cuando la API este en desarrollo y `AUTH_SWAGGER_ON` este habilitada.
- [x] 2.2 Configurar Swagger UI para exponer `Authorize` solo cuando se cumpla la condicion de desarrollo, manteniendo intacta la documentacion de Swagger en los demas casos.
- [x] 2.3 Verificar que la configuracion no altere el contrato ni el comportamiento de `POST /auth/login` y que el flujo soportado siga siendo login + carga manual de `Bearer <token>`.

## 3. Metadata Swagger en endpoints protegidos

- [x] 3.1 Identificar los decoradores compuestos en `apps/api/src/modules/*/api/swagger/` correspondientes a endpoints protegidos por autenticacion.
- [x] 3.2 Agregar la metadata Swagger de seguridad Bearer solo en esos decoradores compuestos, sin modificar controllers ni marcar endpoints publicos por defecto.
- [x] 3.3 Revisar que los endpoints publicos de `auth`, `health` y otros modulos no queden documentados erróneamente como protegidos.

## 4. Documentacion y verificacion

- [x] 4.1 Actualizar la documentacion funcional relevante para explicar el uso en desarrollo de Swagger: login, copia del token y formato `Bearer <token>` en `Authorize`.
- [x] 4.2 Ejecutar verificaciones enfocadas para confirmar que la app levanta con la nueva configuracion y que no se rompen las rutas existentes de Swagger.
- [ ] 4.3 Probar manualmente en local y en Docker de desarrollo que `Authorize` aparece solo cuando corresponde y que los endpoints protegidos aceptan el token cargado desde Swagger UI.
