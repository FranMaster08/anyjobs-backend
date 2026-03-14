## ADDED Requirements

### Requirement: Prohibido crear/modificar endpoints sin tests
Es PROHIBIDO crear o modificar un endpoint sin:
1) unit tests que cubran la lógica del caso de uso (application/domain según aplique)
2) E2E tests que validen el comportamiento HTTP real del endpoint (Jest + TestingModule + Supertest)

#### Scenario: Implementación de un endpoint nuevo
- **WHEN** se introduce un endpoint nuevo en el API
- **THEN** existen unit tests del caso de uso y E2E tests del endpoint (happy path + error path)

### Requirement: Unit tests basados en ports (sin DB real)
Los unit tests de `application/` MUST mockear únicamente `application/ports/*` y MUST NOT depender de DB real ni adaptadores concretos.

#### Scenario: Test unitario de un caso de uso
- **WHEN** se ejecuta un test unitario de un caso de uso
- **THEN** todas las dependencias externas están mockeadas mediante ports y no hay IO real

### Requirement: E2E determinísticos y repetibles
Los E2E tests MUST correr de forma repetible y determinística. Si hay dependencias externas, MUST usarse contenedores/compose de test o fakes/in-memory controlados por el test.

#### Scenario: Ejecución repetida de E2E
- **WHEN** se ejecuta la suite E2E dos veces seguidas
- **THEN** los resultados son consistentes y no dependen de orden ni de estado compartido sucio

