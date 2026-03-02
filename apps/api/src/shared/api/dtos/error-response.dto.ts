import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 401, description: 'HTTP status code' })
  status!: number;

  @ApiProperty({ example: 'AUTH.UNAUTHORIZED', description: 'Stable error code from the error catalog' })
  errorCode!: string;

  @ApiProperty({ example: 'No autenticado.', description: 'Client-facing message (stable)' })
  message!: string;

  @ApiProperty({ example: 'Missing or invalid credentials.', description: 'Short technical message (catalog-controlled)' })
  technicalMessage!: string;

  @ApiProperty({ example: 'c9e4a2d1-2c5c-4c55-93db-2e3a4c63ef6a', description: 'Correlation ID for tracing' })
  correlationId!: string;

  @ApiProperty({ example: '2026-03-01T18:30:00.000Z', description: 'ISO-8601 timestamp' })
  timestamp!: string;

  @ApiPropertyOptional({ description: 'Optional structured details (e.g. validation)', example: { message: 'Bad Request' } })
  details?: unknown;
}

