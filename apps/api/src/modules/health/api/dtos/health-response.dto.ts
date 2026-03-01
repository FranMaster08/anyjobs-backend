import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Estado del servicio.',
    example: 'ok',
  })
  status!: 'ok';
}

