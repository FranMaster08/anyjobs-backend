import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { OpenRequestsListResponseDto } from '../dtos';

export function GetOpenRequestsListSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiOperation({
      summary: 'Listar open requests (paginado)',
      description: 'Lista paginada de open requests con respuesta compatible (items+meta y nextPage/hasMore).',
    }),
    ApiOkResponse({ type: OpenRequestsListResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
  );
}

