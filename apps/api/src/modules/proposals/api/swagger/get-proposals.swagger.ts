import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';
import { ProposalsListResponseDto } from '../dtos';

export function GetProposalsSwagger() {
  return applyDecorators(
    ApiTags('Proposals'),
    ApiOperation({
      summary: 'Listar proposals (paginado)',
      description: 'Lista proposals con filtros opcionales y paginación estándar (items+meta).',
    }),
    ApiOkResponse({ type: ProposalsListResponseDto }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}

