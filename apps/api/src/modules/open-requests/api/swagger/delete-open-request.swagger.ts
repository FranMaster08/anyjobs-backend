import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';

export function DeleteOpenRequestSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Eliminar open request (baja lógica)',
      description:
        'Marca la solicitud como eliminada (soft delete). Requiere permiso `open-requests.delete` y ser titular.',
    }),
    ApiNoContentResponse({ description: 'Eliminada correctamente' }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
    ApiNotFoundResponse({ type: ErrorResponseDto }),
  );
}
