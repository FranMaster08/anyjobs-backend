import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateClientProfileRequestDto {
  @ApiProperty({
    example: 'CARD',
    enum: ['CARD', 'TRANSFER', 'CASH', 'WALLET'],
    description: 'Método de pago preferido',
  })
  @IsIn(['CARD', 'TRANSFER', 'CASH', 'WALLET'])
  preferredPaymentMethod!: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';
}

