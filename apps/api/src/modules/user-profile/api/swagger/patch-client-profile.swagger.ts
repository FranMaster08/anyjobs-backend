import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';

export function PatchMeClientProfileSwagger() {
  return applyDecorators(
    ApiTags('Users'),
    ApiOperation({
      summary: 'Actualizar client profile del usuario actual',
      description: 'Actualiza preferredPaymentMethod.',
    }),
    ApiNoContentResponse({ description: 'Actualizado' }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}

