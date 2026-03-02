import { ApiProperty } from '@nestjs/swagger';

export class PhoneAvailableResponseDto {
  @ApiProperty({ example: true, description: 'Indica si el teléfono está disponible' })
  available!: boolean;
}

