## ADDED Requirements

### Requirement: Política base deny-by-default
Todo endpoint HTTP MUST estar protegido por autenticación y autorización (RBAC). Si un endpoint no declara explícitamente metadata de permisos/roles requeridos, el sistema MUST denegar el acceso (deny-by-default).

#### Scenario: Endpoint sin metadata RBAC
- **WHEN** un request llega a un endpoint que no declara permisos/roles requeridos
- **THEN** el acceso es denegado por defecto

### Requirement: Respuestas correctas para 401 y 403
El sistema MUST responder:
- `401 Unauthorized` cuando no hay autenticación válida
- `403 Forbidden` cuando hay autenticación válida pero no tiene el permiso/rol requerido
El sistema MUST NOT “disfrazar” faltas de permiso como 404 o 200.

#### Scenario: Sin token
- **WHEN** el cliente llama un endpoint protegido sin credenciales válidas
- **THEN** recibe 401

#### Scenario: Con token pero sin permiso
- **WHEN** el cliente autenticado llama un endpoint para el cual no tiene permiso
- **THEN** recibe 403

### Requirement: Decoradores explícitos para RBAC y endpoints públicos
Los endpoints MUST declarar sus requisitos RBAC mediante decoradores (por ejemplo `@RequirePermissions(...)` o `@RequireRoles(...)`). Si un endpoint es intencionalmente público, MUST declararse explícitamente con un decorador (por ejemplo `@Public()`), y MUST estar documentado.

#### Scenario: Endpoint público declarado
- **WHEN** existe un endpoint marcado como público con `@Public()`
- **THEN** puede accederse sin autenticación y la documentación indica explícitamente que es público

### Requirement: Testing E2E mínimo por endpoint protegido
Cada endpoint MUST tener E2E tests que cubran al menos: 401 (sin auth), 403 (sin permiso), y 2xx (con permiso).

#### Scenario: Suite E2E de un endpoint
- **WHEN** se ejecutan los E2E tests para un endpoint protegido
- **THEN** existen casos que verifican 401, 403 y 2xx según credenciales/permisos

