import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { DOCUMENT_TYPES } from '../../domain/types/document-type.type';
import { ISO_COUNTRY_CODES } from '../../../../shared/location/world-countries.data';

export class UpdatePersonalInfoRequestDto {
  @ApiProperty({ example: 'DNI', enum: [...DOCUMENT_TYPES], description: 'Tipo de documento' })
  @IsIn([...DOCUMENT_TYPES])
  documentType!: (typeof DOCUMENT_TYPES)[number];

  @ApiProperty({ example: '12345678A', description: 'Número de documento (min 5, max 24)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(24)
  documentNumber!: string;

  @ApiProperty({ example: '1990-01-31', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  birthDate!: string;

  @ApiPropertyOptional({
    example: 'FEMALE',
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    description: 'Género',
  })
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

  @ApiPropertyOptional({ example: 'CO', description: 'Nacionalidad (ISO 3166-1 alpha-2)' })
  @IsOptional()
  @IsIn([...ISO_COUNTRY_CODES])
  nationality?: string;
}

