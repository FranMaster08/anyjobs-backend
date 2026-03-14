## Why

Hoy el proyecto no cuenta con un estándar formal de containerización para desarrollo, CI y producción. Esto genera diferencias entre entornos, dificulta reproducir builds de forma confiable y deja abierta la posibilidad de que la imagen final incluya herramientas, dependencias y artefactos innecesarios para runtime.

Docker recomienda usar multi-stage builds para separar el proceso de compilación del runtime final, reduciendo tamaño e impacto de seguridad.
Ver: `https://docs.docker.com/build/building/multi-stage/`.

Para producción, una estrategia basada en una imagen mínima de runtime es la opción más adecuada cuando el objetivo es seguridad y ligereza. Las imágenes distroless están diseñadas precisamente para contener solo la aplicación y sus dependencias de ejecución, sin shell, sin package manager y sin utilidades innecesarias, lo que reduce aún más la superficie de ataque.
Ver: `https://github.com/GoogleContainerTools/distroless` y `https://docs.docker.com/dhi/core-concepts/distroless/`.

## What Changes

- Se define un estándar oficial de dockerización para el proyecto.
- Se implementa un Dockerfile multi-stage con etapas separadas para:
  - dependencias
  - build
  - pruebas opcionales
  - runtime final
- Se utiliza una imagen de build basada en una imagen oficial adecuada para Node/NestJS y una imagen de runtime de producción mínima y endurecida.
- Se establece como estrategia recomendada para producción una imagen final distroless (o equivalente mínima), ejecutando la aplicación sin privilegios y sin herramientas de administración innecesarias.
- Se optimiza el build para copiar únicamente los artefactos necesarios de ejecución al stage final.
- Se agregan lineamientos para:
  - uso de `.dockerignore`
  - no inclusión de secretos en la imagen
  - ejecución como usuario no root
  - reducción del contenido del runtime
  - compatibilidad con CI/CD
- Se documenta una convención para imágenes de:
  - desarrollo local
  - validación en CI
  - producción
- Se define una estrategia de build reproducible, con soporte para cache y posibilidad de publicación multi-plataforma cuando el pipeline lo requiera.
  - Ver: `https://docs.docker.com/build/building/multi-platform/`.

## Capabilities

### New Capabilities

- `containerization-foundation`: Estandarización de Docker para build, test y ejecución del proyecto.
- `multistage-image-build`: Pipeline de imagen multi-stage para separar compilación, validación y runtime final.
- `secure-production-runtime`: Runtime de producción basado en imagen mínima y segura, orientado a reducir superficie de ataque y tamaño final.
- `portable-runtime-packaging`: Empaquetado consistente para ejecutar la aplicación de forma homogénea entre local, CI y producción.

### Modified Capabilities

- `deployment-packaging`: El proceso de empaquetado del servicio pasa a depender de una imagen Docker estándar y no de configuraciones implícitas del entorno.
- `ci-build-flow`: El pipeline podrá construir, validar y publicar imágenes versionadas siguiendo el nuevo estándar de containerización.

## Impact

- **Código**: se agregará al repositorio un `Dockerfile` multi-stage, un `.dockerignore` y documentación operativa para build y ejecución.
- **Build**: la compilación quedará separada del runtime, permitiendo copiar al stage final solo `dist/`, dependencias de producción y archivos mínimos requeridos por la app.
- **Producción**: la imagen final será más pequeña, más segura y más predecible, al eliminar shells, package managers y utilidades ajenas al runtime.
- **Seguridad**: se reduce la superficie de ataque al minimizar el contenido de la imagen y ejecutar con usuario no privilegiado.
- **Operación**: será necesario definir variables de entorno de runtime en despliegue, sin hornearlas dentro de la imagen.
- **CI/CD**: el pipeline podrá incorporar etapas de build, scan, test y publicación de imagen, además de builds multi-arquitectura si son necesarios.
- **Diagnóstico**: el uso de imágenes distroless mejora seguridad, pero reduce capacidades de depuración interactiva dentro del contenedor; por ello, la validación deberá apoyarse más en logs, healthchecks y CI.

## Design Constraints

- El `Dockerfile` debe usar multi-stage builds.
- El stage final de producción no debe contener toolchains de compilación, archivos temporales ni dependencias de desarrollo.
- La imagen base del runtime debe ser mínima, preferiblemente distroless o equivalente endurecida para Node.js/NestJS.
- La ejecución debe realizarse como usuario no root.
- No deben incluirse secretos, tokens ni archivos `.env` dentro de la imagen.
- El runtime final debe contener únicamente los artefactos indispensables para arrancar la aplicación.
- Debe existir separación clara entre imagen de desarrollo y de producción.
- La solución debe ser compatible con el pipeline actual y permitir futura extensión a builds multi-plataforma y publicación de imágenes.
