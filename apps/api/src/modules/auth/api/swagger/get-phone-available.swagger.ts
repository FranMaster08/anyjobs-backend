import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { PhoneAvailableResponseDto } from '../dtos';

export function GetPhoneAvailableSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Consultar disponibilidad de teléfono',
      description: 'Retorna { available } para el phoneNumber proporcionado.',
    }),
    ApiOkResponse({ type: PhoneAvailableResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
  );
}

