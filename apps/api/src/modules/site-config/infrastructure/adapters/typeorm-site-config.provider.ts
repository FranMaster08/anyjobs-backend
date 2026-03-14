import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SiteConfig } from '../../domain/site-config';
import type { SiteConfigProviderPort } from '../../application/ports/site-config-provider.port';
import { SiteConfigEntity } from '../entities/site-config.entity';

const DEFAULT_SITE_CONFIG_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class TypeOrmSiteConfigProvider implements SiteConfigProviderPort {
  constructor(@InjectRepository(SiteConfigEntity) private readonly repo: Repository<SiteConfigEntity>) {}

  async getSiteConfig(): Promise<SiteConfig> {
    const row = await this.repo.findOne({ where: { id: DEFAULT_SITE_CONFIG_ID } });
    if (!row) {
      // Fallback mínimo: evita 500 si aún no seedearon, pero permite que E2E detecte falta de datos si se decide.
      return {
        brandName: 'AnyJobs',
        hero: { title: 'Encuentra ayuda cerca de ti', subtitle: 'Profesionales verificados para tus necesidades.' },
        sections: { requests: { label: '', title: '', cta: '' }, location: { label: '', title: '', body: '', openMap: '', viewMap: '', preview: { title: '', hintNoLocation: '', hintWithLocation: '' } }, contact: { label: '', title: '', intro: '', phone: { label: '', value: '', hint: '', href: '' }, email: { label: '', value: '', hint: '', href: '' } } },
      } as any;
    }
    const hero = typeof (row as any).hero === 'string' ? JSON.parse((row as any).hero) : row.hero;
    const sections = typeof (row as any).sections === 'string' ? JSON.parse((row as any).sections) : row.sections;
    return {
      brandName: row.brandName,
      hero,
      sections,
    };
  }
}

