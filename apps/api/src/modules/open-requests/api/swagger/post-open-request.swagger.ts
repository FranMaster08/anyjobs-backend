import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { OpenRequestDetailDto } from '../dtos';

export function PostOpenRequestSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Crear open request',
      description: 'Crea una solicitud abierta. Requiere Bearer y permiso `open-requests.create`. El titular es el `userId` autenticado.',
    }),
    ApiCreatedResponse({ type: OpenRequestDetailDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}
