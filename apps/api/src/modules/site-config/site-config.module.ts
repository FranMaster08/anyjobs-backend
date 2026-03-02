import { Module } from '@nestjs/common';
import { SiteConfigController } from './api/controllers/site-config.controller';
import { GetSiteConfigUseCase } from './application/use-cases/get-site-config.use-case';
import { SITE_CONFIG_PROVIDER } from './application/ports/tokens';
import { StaticSiteConfigProvider } from './infrastructure/adapters/static-site-config.provider';

@Module({
  controllers: [SiteConfigController],
  providers: [
    GetSiteConfigUseCase,
    { provide: SITE_CONFIG_PROVIDER, useClass: StaticSiteConfigProvider },
  ],
})
export class SiteConfigModule {}

