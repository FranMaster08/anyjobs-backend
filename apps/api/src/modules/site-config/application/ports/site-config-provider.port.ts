import type { SiteConfig } from '../../domain/site-config';

export interface SiteConfigProviderPort {
  getSiteConfig(): Promise<SiteConfig>;
}

