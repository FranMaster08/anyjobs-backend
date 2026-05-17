import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { NotificationDto } from '../dtos';

export function PatchNotificationReadSwagger() {
  return applyDecorators(
    ApiTags('Notifications'),
    ApiBearerAuth('bearer'),
    ApiOperation({ summary: 'Marcar una notificación como leída' }),
    ApiOkResponse({ type: NotificationDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiNotFoundResponse({ type: ErrorResponseDto }),
  );
}
