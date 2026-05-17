import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { MarkAllReadResponseDto } from '../dtos';

export function PatchReadAllSwagger() {
  return applyDecorators(
    ApiTags('Notifications'),
    ApiBearerAuth('bearer'),
    ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' }),
    ApiOkResponse({ type: MarkAllReadResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
  );
}
