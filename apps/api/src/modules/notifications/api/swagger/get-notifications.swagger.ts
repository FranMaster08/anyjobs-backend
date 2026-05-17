import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { NotificationsListResponseDto } from '../dtos';

export function GetNotificationsSwagger() {
  return applyDecorators(
    ApiTags('Notifications'),
    ApiBearerAuth('bearer'),
    ApiOperation({ summary: 'Listar notificaciones del usuario autenticado' }),
    ApiOkResponse({ type: NotificationsListResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
  );
}
