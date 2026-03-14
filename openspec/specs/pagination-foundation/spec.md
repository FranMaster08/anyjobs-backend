## Purpose

Estandarizar el contrato y las reglas de paginación para endpoints de búsqueda/listado.

## Requirements

### Requirement: Contrato de respuesta paginada obligatorio
Todo endpoint de búsqueda/listado MUST responder con un contrato paginado que incluya:
- `items`: lista (posiblemente vacía)
- `meta`: objeto con `totalItems`, `page` (1-based), `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`, `nextPage` (número o null), `previousPage` (número o null)

#### Scenario: Página con resultados
- **WHEN** el cliente consulta un listado con filtros válidos
- **THEN** la respuesta incluye `items` y `meta` con todos los campos obligatorios y `totalItems` representa el total global que cumple el filtro

### Requirement: Parámetros de request para paginación
Todo endpoint de búsqueda/listado MUST aceptar `page` (default 1) y `pageSize` (default configurable). `page` MUST ser \(\ge 1\) y `pageSize` MUST ser \(\ge 1\). Debe existir un máximo configurable por env para `pageSize` y la API MUST aplicar una única política consistente (rechazar con 400 o clamp al máximo).

#### Scenario: pageSize excede el máximo
- **WHEN** el cliente envía `pageSize` mayor al máximo configurado
- **THEN** la API aplica la política global definida (400 o clamp) de forma consistente

### Requirement: Orden determinístico en paginación
Los listados/búsquedas MUST usar un orden determinístico. Si el cliente no especifica sort, el endpoint MUST aplicar un sort default estable (por ejemplo `createdAt desc`) para evitar resultados “saltando” entre páginas.

#### Scenario: Dos requests consecutivos a la misma página
- **WHEN** el cliente solicita dos veces la misma página con los mismos filtros
- **THEN** el orden de `items` es determinístico bajo el mismo estado de datos y el sort default aplicado es estable

