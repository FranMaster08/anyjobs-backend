import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'a0b1c2d3-e4f5-6789-aaaa-bbbbccccdddd' })
  id!: string;

  @ApiProperty({ example: 'María García' })
  fullName!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty({ example: ['WORKER'], isArray: true, enum: ['CLIENT', 'WORKER'] })
  roles!: Array<'CLIENT' | 'WORKER'>;

  @ApiPropertyOptional({ example: '+34600111222' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: true })
  emailVerified?: boolean;

  @ApiPropertyOptional({ example: false })
  phoneVerified?: boolean;

  @ApiPropertyOptional({ example: 'PENDING', enum: ['PENDING', 'ACTIVE'] })
  status?: 'PENDING' | 'ACTIVE';

  @ApiPropertyOptional({ example: 'ES' })
  countryCode?: string;

  @ApiPropertyOptional({ example: 'Barcelona' })
  city?: string;

  @ApiPropertyOptional({ example: 'Eixample' })
  area?: string;

  @ApiPropertyOptional({ example: 10 })
  coverageRadiusKm?: number;

  @ApiPropertyOptional({ example: ['Limpieza', 'Reformas'], isArray: true })
  workerCategories?: string[];

  @ApiPropertyOptional({ example: 'Profesional con experiencia' })
  workerHeadline?: string;

  @ApiPropertyOptional({ example: 'Trabajo rápido y cuidadoso.' })
  workerBio?: string;

  @ApiPropertyOptional({ example: 'CARD', enum: ['CARD', 'TRANSFER', 'CASH', 'WALLET'] })
  preferredPaymentMethod?: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';

  @ApiPropertyOptional({ example: 'DNI', enum: ['DNI', 'NIE', 'PASSPORT'] })
  documentType?: 'DNI' | 'NIE' | 'PASSPORT';

  @ApiPropertyOptional({ example: '12345678A' })
  documentNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-31' })
  birthDate?: string;

  @ApiPropertyOptional({ example: 'FEMALE', enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] })
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

  @ApiPropertyOptional({ example: 'ES' })
  nationality?: string;

  @ApiPropertyOptional({ example: '2026-03-01T18:30:00.000Z' })
  createdAt?: string;
}

