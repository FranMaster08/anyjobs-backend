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
        'Inicia un draft de onboarding y genera un flow de registro asociado (vía cookie same-origin) para completar verificación y datos antes de crear el usuario definitivo.',
    }),
    ApiOkResponse({ type: RegisterResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiConflictResponse({ type: ErrorResponseDto }),
  );
}

