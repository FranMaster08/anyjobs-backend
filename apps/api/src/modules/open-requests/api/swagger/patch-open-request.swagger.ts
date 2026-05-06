import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { OpenRequestDetailDto } from '../dtos';

export function PatchOpenRequestSwagger() {
  return applyDecorators(
    ApiTags('Open Requests'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Actualizar open request (parcial)',
      description:
        'Actualización parcial. Requiere permiso `open-requests.update` y ser titular (`owner_user_id`) del recurso.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          excerpt: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
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
    ApiOkResponse({ type: OpenRequestDetailDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
    ApiNotFoundResponse({ type: ErrorResponseDto }),
  );
}
