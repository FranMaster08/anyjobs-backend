import { Module } from '@nestjs/common';
import { SiteConfigController } from './api/controllers/site-config.controller';
import { GetSiteConfigUseCase } from './application/use-cases/get-site-config.use-case';
import { SITE_CONFIG_PROVIDER } from './application/ports/tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteConfigEntity } from './infrastructure/entities/site-config.entity';
import { TypeOrmSiteConfigProvider } from './infrastructure/adapters/typeorm-site-config.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SiteConfigEntity])],
  controllers: [SiteConfigController],
  providers: [
    GetSiteConfigUseCase,
    { provide: SITE_CONFIG_PROVIDER, useClass: TypeOrmSiteConfigProvider },
  ],
})
export class SiteConfigModule {}

