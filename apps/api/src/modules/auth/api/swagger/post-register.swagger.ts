import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { RegisterResponseDto } from '../dtos';

export function PostRegisterSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Registrar usuario (MVP)',
      description:
        'Crea un usuario en estado PENDING y genera un flow de registro asociado (vía cookie same-origin) para verificar OTP sin userId.',
    }),
    ApiOkResponse({ type: RegisterResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiConflictResponse({ type: ErrorResponseDto }),
  );
}

