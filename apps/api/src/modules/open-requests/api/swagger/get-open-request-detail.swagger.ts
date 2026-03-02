import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { OpenRequestDetailDto } from '../dtos';

export function GetOpenRequestDetailSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiOperation({
      summary: 'Obtener detalle de open request',
      description: 'Retorna el detalle. `images` siempre existe y es un array (puede ser []).',
    }),
    ApiOkResponse({ type: OpenRequestDetailDto }),
    ApiNotFoundResponse({ type: ErrorResponseDto }),
  );
}

