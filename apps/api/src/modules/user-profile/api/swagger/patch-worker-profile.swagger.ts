import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';

export function PatchMeWorkerProfileSwagger() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Actualizar worker profile del usuario actual',
      description: 'Actualiza categorías y opcionalmente headline/bio.',
    }),
    ApiNoContentResponse({ description: 'Actualizado' }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}

