import { Injectable } from '@nestjs/common';
import type { SiteConfig } from '../../domain';
import type { SiteConfigProviderPort } from '../../application/ports/site-config-provider.port';

@Injectable()
export class StaticSiteConfigProvider implements SiteConfigProviderPort {
  async getSiteConfig(): Promise<SiteConfig> {
    return {
      brandName: 'AnyJobs',
      hero: {
        title: 'Encuentra ayuda cerca de ti',
        subtitle: 'Profesionales verificados para tus necesidades.',
      },
      sections: {
        requests: { label: 'Solicitudes', title: 'Últimas solicitudes', cta: 'Ver más' },
        location: {
          label: 'Ubicación',
          title: 'Busca por zona',
          body: 'Elige tu zona para ver profesionales disponibles.',
          openMap: 'Abrir mapa',
          viewMap: 'Ver mapa',
          preview: {
            title: 'Tu zona',
            hintNoLocation: 'Selecciona una ubicación para ver solicitudes cerca.',
            hintWithLocation: 'Mostrando solicitudes cerca de tu ubicación.',
          },
        },
        contact: {
          label: 'Contacto',
          title: '¿Necesitas ayuda?',
          intro: 'Escríbenos o llámanos y te ayudamos.',
          phone: { label: 'Teléfono', value: '+34 600 111 222', hint: 'L-V 9:00-18:00', href: 'tel:+34600111222' },
          email: { label: 'Email', value: 'hola@anyjobs.example', hint: 'Respuesta en 24h', href: 'mailto:hola@anyjobs.example' },
        },
      },
    };
  }
}

