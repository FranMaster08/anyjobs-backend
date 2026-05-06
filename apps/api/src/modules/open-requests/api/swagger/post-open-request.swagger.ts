import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { OpenRequestDetailDto } from '../dtos';

export function PostOpenRequestSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Crear open request',
      description: 'Crea una solicitud abierta. Requiere Bearer y permiso `open-requests.create`. El titular es el `userId` autenticado.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: [
          'title',
          'excerpt',
          'description',
          'tags',
          'locationLabel',
          'budgetLabel',
          'contactPhone',
          'contactEmail',
        ],
        properties: {
          title: { type: 'string' },
          excerpt: { type: 'string' },
          description: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          locationLabel: { type: 'string' },
          budgetLabel: { type: 'string' },
          contactPhone: { type: 'string' },
          contactEmail: { type: 'string' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                alt: { type: 'string' },
              },
            },
          },
          files: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
          },
        },
      },
    }),
    ApiCreatedResponse({ type: OpenRequestDetailDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}
