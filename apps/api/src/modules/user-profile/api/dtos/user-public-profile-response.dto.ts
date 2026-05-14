import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfileMetricsDto } from './user-profile-metrics.dto';

/** Perfil visible a terceros: sin email, teléfono ni documentos. */
export class UserPublicProfileResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ enum: ['CLIENT', 'WORKER'], isArray: true })
  roles!: Array<'CLIENT' | 'WORKER'>;

  @ApiPropertyOptional()
  countryCode?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  area?: string;

  /** Headline público de worker (si aplica). */
  @ApiPropertyOptional()
  workerHeadline?: string;

  @ApiPropertyOptional()
  workerBio?: string;

  @ApiPropertyOptional({ type: [String] })
  workerCategories?: string[];

  @ApiProperty({ enum: ['public'] })
  visibility!: 'public';

  @ApiProperty({ type: UserProfileMetricsDto })
  metrics!: UserProfileMetricsDto;
}
