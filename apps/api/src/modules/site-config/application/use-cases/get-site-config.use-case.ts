import { Inject, Injectable } from '@nestjs/common';
import { SITE_CONFIG_PROVIDER } from '../ports';
import type { SiteConfigProviderPort } from '../ports';
import type { SiteConfig } from '../../domain';

@Injectable()
export class GetSiteConfigUseCase {
  constructor(@Inject(SITE_CONFIG_PROVIDER) private readonly provider: SiteConfigProviderPort) {}

  async execute(): Promise<SiteConfig> {
    return this.provider.getSiteConfig();
  }
}

