import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';

export function PostVerifyEmailSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Verificar email por OTP',
      description:
        'Verifica el email usando solo { otpCode }. El usuario se resuelve server-side mediante el flow de registro (cookie).',
    }),
    ApiNoContentResponse({ description: 'OTP aplicado (no content)' }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
  );
}

