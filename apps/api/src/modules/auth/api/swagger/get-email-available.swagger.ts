import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { EmailAvailableResponseDto } from '../dtos';

export function GetEmailAvailableSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Consultar disponibilidad de email',
      description: 'Retorna { available } para el email proporcionado.',
    }),
    ApiOkResponse({ type: EmailAvailableResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
  );
}

