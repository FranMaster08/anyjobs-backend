import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { UnreadCountResponseDto } from '../dtos';

export function GetUnreadCountSwagger() {
  return applyDecorators(
    ApiTags('Notifications'),
    ApiBearerAuth('bearer'),
    ApiOperation({ summary: 'Conteo de notificaciones no leídas' }),
    ApiOkResponse({ type: UnreadCountResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
  );
}
