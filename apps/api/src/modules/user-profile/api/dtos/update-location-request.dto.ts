import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { SUPPORTED_COUNTRY_CODES } from '../../../../shared/location/supported-location.catalog';

export class UpdateLocationRequestDto {
  @ApiProperty({ example: 'Barcelona', description: 'Ciudad' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Medellín', description: 'Municipio' })
  @IsString()
  @IsNotEmpty()
  municipality!: string;

  @ApiProperty({ example: 'El Poblado', description: 'Barrio (texto libre)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  area!: string;

  @ApiProperty({ example: 'CO', enum: [...SUPPORTED_COUNTRY_CODES], description: 'País soportado (CO, AR)' })
  @IsIn([...SUPPORTED_COUNTRY_CODES])
  countryCode!: (typeof SUPPORTED_COUNTRY_CODES)[number];

  @ApiPropertyOptional({ example: 10, description: 'Radio de cobertura en km' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coverageRadiusKm?: number;
}

