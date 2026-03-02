import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/security/public.decorator';
import { GetSiteConfigUseCase } from '../../application/use-cases/get-site-config.use-case';
import { SiteConfigResponseDto } from '../dtos';
import { GetSiteConfigSwagger } from '../swagger';

@ApiTags('Site Config')
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly getSiteConfigUseCase: GetSiteConfigUseCase) {}

  @Public()
  @GetSiteConfigSwagger()
  @Get()
  async getConfig(): Promise<SiteConfigResponseDto> {
    return (await this.getSiteConfigUseCase.execute()) as unknown as SiteConfigResponseDto;
  }
}

