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

export function PatchMePersonalInfoSwagger() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Actualizar información personal del usuario actual',
      description: 'Actualiza documento, birthDate y opcionalmente gender/nationality.',
    }),
    ApiNoContentResponse({ description: 'Actualizado' }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}

