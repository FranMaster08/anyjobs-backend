import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { OpenRequestsListResponseDto } from '../dtos';

export function GetMyOpenRequestsListSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Listar mis open requests (paginado)',
      description:
        'Lista paginada de open requests cuyo `ownerUserId` coincide con el `userId` autenticado. Requiere Bearer y permiso `open-requests.read.own`.',
    }),
    ApiOkResponse({ type: OpenRequestsListResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}
