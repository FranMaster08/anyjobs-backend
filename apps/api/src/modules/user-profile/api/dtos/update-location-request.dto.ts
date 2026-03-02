import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLocationRequestDto {
  @ApiProperty({ example: 'Barcelona', description: 'Ciudad' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({ example: 'Eixample', description: 'Zona/área' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ example: 'ES', description: 'Código de país (ej. ES)' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ example: 10, description: 'Radio de cobertura en km' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coverageRadiusKm?: number;
}

