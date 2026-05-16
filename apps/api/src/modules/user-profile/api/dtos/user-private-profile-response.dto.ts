import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfileMetricsDto } from './user-profile-metrics.dto';

/** Perfil del titular autenticado: incluye datos de cuenta y contacto. */
export class UserPrivateProfileResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['CLIENT', 'WORKER'], isArray: true })
  roles!: Array<'CLIENT' | 'WORKER'>;

  @ApiPropertyOptional({ enum: ['PENDING', 'ACTIVE'] })
  status?: 'PENDING' | 'ACTIVE';

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  phoneVerified?: boolean;

  @ApiPropertyOptional()
  countryCode?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  municipality?: string;

  @ApiPropertyOptional()
  area?: string;

  @ApiPropertyOptional()
  coverageRadiusKm?: number;

  @ApiPropertyOptional()
  workerHeadline?: string;

  @ApiPropertyOptional()
  workerBio?: string;

  @ApiPropertyOptional({ type: [String] })
  workerCategories?: string[];

  @ApiPropertyOptional({ enum: ['CARD', 'TRANSFER', 'CASH', 'WALLET'] })
  preferredPaymentMethod?: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';

  @ApiPropertyOptional({ enum: ['DNI', 'NIE', 'PASSPORT', 'CC'] })
  documentType?: 'DNI' | 'NIE' | 'PASSPORT' | 'CC';

  @ApiPropertyOptional()
  documentNumber?: string;

  @ApiPropertyOptional()
  birthDate?: string;

  @ApiPropertyOptional()
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

  @ApiPropertyOptional()
  nationality?: string;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiProperty({ enum: ['private'] })
  visibility!: 'private';

  @ApiProperty({ type: UserProfileMetricsDto })
  metrics!: UserProfileMetricsDto;
}
