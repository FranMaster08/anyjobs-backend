## 1. Data model and storage abstraction

- [x] 1.1 Crear la entidad/modelo de imagen con relaciones a propuesta y propietario (`ownerUserId`), incluyendo índices necesarios.
- [x] 1.2 Definir el contrato `ImageStorageProvider` (guardar, eliminar y resolver URL) sin acoplar dominio al proveedor físico.
- [x] 1.3 Implementar `LocalImageStorageProvider` para persistencia en servidor y registrar su wiring por DI/configuración.
- [x] 1.4 Implementar estrategia de compensación para evitar inconsistencias entre persistencia de archivo y base de datos en fallas parciales.

## 2. API write flow for open requests

- [x] 2.1 Adaptar `POST /open-requests` para aceptar carga de imágenes y validar regla de negocio de mínimo 1 y máximo 6.
- [x] 2.2 Adaptar `PATCH /open-requests/{id}` para gestionar altas/bajas/reemplazos de imágenes manteniendo regla 1..6 en estado final.
- [x] 2.3 Implementar validaciones de ownership en backend para impedir mutaciones sobre imágenes de otros usuarios.
- [x] 2.4 Homologar respuestas de error de validación/autorización según contrato global del API.

## 3. API read flow and contracts

- [x] 3.1 Incluir URLs de visualización de imágenes en `GET /open-requests/{id}` (y en listados si aplica al contrato vigente).
- [x] 3.2 Asegurar que usuarios autorizados por reglas de propuesta puedan visualizar imágenes aunque no sean propietarios.
- [x] 3.3 Mantener compatibilidad de contratos públicos existentes y documentar cualquier ajuste no rompiente en payloads.

## 4. Docs and quality gates

- [x] 4.1 Actualizar Swagger/OpenAPI para endpoints afectados (multipart/form-data, schemas de respuesta y códigos de error).
- [ ] 4.2 Agregar pruebas unitarias e integración para límites de cantidad, ownership, autorización de lectura y generación de URLs.
- [x] 4.3 Añadir pruebas de contrato para `ImageStorageProvider` que faciliten migración futura a proveedor cloud.
