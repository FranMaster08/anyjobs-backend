import { ApiProperty } from '@nestjs/swagger';

export class EmailAvailableResponseDto {
  @ApiProperty({ example: true, description: 'Indica si el email está disponible' })
  available!: boolean;
}

