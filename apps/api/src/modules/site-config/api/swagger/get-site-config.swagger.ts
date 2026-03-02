import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteConfigResponseDto } from '../dtos';

export function GetSiteConfigSwagger() {
  return applyDecorators(
    ApiTags('Site Config'),
    ApiOperation({
      summary: 'Obtener configuración inicial del sitio',
      description: 'Endpoint público para bootstrap del home (brand/hero/sections).',
    }),
    ApiOkResponse({ type: SiteConfigResponseDto }),
  );
}

