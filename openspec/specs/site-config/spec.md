## Purpose

Definir el contrato funcional de la API de configuración del sitio para el MVP.

## Requirements

### Requirement: Site Config API base path
El sistema MUST exponer la sub-API de configuración del sitio bajo el base path `/site-config`.

#### Scenario: Site Config API is reachable under /site-config
- **WHEN** el cliente construye la URL de la API de site config como `<host>/site-config`
- **THEN** las rutas definidas en este spec responden bajo ese prefijo

### Requirement: Get site config for MVP bootstrap
El sistema MUST exponer `GET /site-config` y responder `200` con JSON con la siguiente estructura mínima:

- `brandName: string`
- `hero: { title: string, subtitle: string }`
- `sections: object` con:
  - `requests: { label: string, title: string, cta: string }`
  - `location: { label: string, title: string, body: string, openMap: string, viewMap: string, preview: { title: string, hintNoLocation: string, hintWithLocation: string } }`
  - `contact: { label: string, title: string, intro: string, phone: { label: string, value: string, hint: string, href: string }, email: { label: string, value: string, hint: string, href: string } }`

#### Scenario: Site config returns required brand/hero/sections structure
- **WHEN** el cliente llama `GET /site-config`
- **THEN** el sistema responde `200` e incluye `brandName`, `hero.title`, `hero.subtitle` y `sections.requests`, `sections.location`, `sections.contact`

