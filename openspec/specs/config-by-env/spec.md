## Purpose

Definir el estándar de configuración por variables de entorno con validación fail-fast y un punto único de acceso.

## Requirements

### Requirement: Configuración por variables de entorno como fuente única
Toda configuración variable (URLs, puertos, credenciales, keys, toggles, timeouts y límites) MUST provenir de variables de entorno y MUST ser accesible solo a través de un `ConfigModule`/`ConfigService` central (o wrapper equivalente).

#### Scenario: Consumo de configuración desde un módulo
- **WHEN** un controller/service/use-case requiere configuración
- **THEN** la obtiene mediante `ConfigService` (o wrapper) y no lee `process.env` directamente

### Requirement: Validación fail-fast de envs antes de iniciar
La aplicación MUST validar las variables de entorno requeridas y sus tipos/rangos antes de levantar el servidor. Si falta una variable requerida o es inválida, el proceso MUST finalizar (fail-fast) y el servidor MUST NOT iniciar.

#### Scenario: Variable requerida faltante
- **WHEN** se inicia la app sin una variable requerida definida por el schema
- **THEN** la app falla al inicio y no queda escuchando en el puerto HTTP

### Requirement: Estructura estándar de configuración
La configuración MUST vivir en `apps/api/src/config/` con archivos separados para: mapeo (`configuration.ts`), validación (`env.validation.ts`) y registro del módulo (`config.module.ts`). Debe existir un `.env.example` en la raíz con todas las variables necesarias documentadas.

#### Scenario: Onboarding de un entorno nuevo
- **WHEN** un desarrollador configura el proyecto en un ambiente nuevo
- **THEN** puede derivar todas las variables requeridas a partir de `.env.example` y el schema de validación

### Requirement: URL pública base opcional para assets (`APP_PUBLIC_URL`)

El sistema MUST exponer una variable de entorno opcional `APP_PUBLIC_URL` (URL absoluta sin barra final, p. ej. `https://api.ejemplo.com`) usada para convertir rutas relativas de recursos servidos por la API (p. ej. imágenes de open requests) en URLs absolutas persistidas y devueltas al cliente.

Si `APP_PUBLIC_URL` no está definida o está vacía tras trim, el valor efectivo MUST derivarse como `http://localhost:<APP_PORT>` donde `<APP_PORT>` es la variable de entorno ya validada del servidor HTTP.

Si `APP_PUBLIC_URL` está definida con un valor no vacío, MUST validarse como URL absoluta válida antes de iniciar.

#### Scenario: Producción con dominio público

- **WHEN** el operador define `APP_PUBLIC_URL=https://api.midominio.com` y `APP_PORT` coherente con el despliegue
- **THEN** la aplicación arranca y usa esa base para resolver rutas relativas de assets hacia URLs absolutas

#### Scenario: Desarrollo local sin variable explícita

- **WHEN** `APP_PUBLIC_URL` no está definida y `APP_PORT=3000`
- **THEN** la URL pública base efectiva es `http://localhost:3000` para resolver assets relativos

