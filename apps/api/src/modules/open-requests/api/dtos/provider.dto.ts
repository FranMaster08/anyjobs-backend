import { ApiProperty } from '@nestjs/swagger';

export class ProviderDto {
  @ApiProperty({ example: 'Limpiezas Express' })
  name!: string;

  @ApiProperty({ example: 'PRO' })
  badge!: string;

  @ApiProperty({ example: 'Responde en 1h' })
  subtitle!: string;
}

