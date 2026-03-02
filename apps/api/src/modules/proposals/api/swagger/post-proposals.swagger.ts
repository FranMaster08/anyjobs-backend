import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { ProposalDto } from '../dtos';

export function PostProposalsSwagger() {
  return applyDecorators(
    ApiTags('Proposals'),
    ApiOperation({
      summary: 'Crear proposal',
      description: 'Crea una propuesta en estado SENT.',
    }),
    ApiCreatedResponse({ type: ProposalDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}

