import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';

export function PostVerifyPhoneSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Verificar teléfono por OTP',
      description:
        'Verifica el teléfono usando solo { otpCode }. El usuario se resuelve server-side mediante el flow de registro (cookie).',
    }),
    ApiNoContentResponse({ description: 'OTP aplicado (no content)' }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
  );
}

