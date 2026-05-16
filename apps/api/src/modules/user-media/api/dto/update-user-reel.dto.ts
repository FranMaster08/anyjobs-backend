import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { DistributionStatus } from '../../infrastructure/entities/user-reel.entity';

const DISTRIBUTION_STATUSES = ['draft', 'testing', 'scaling', 'paused'] as const;

export class UpdateUserReelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional({ enum: DISTRIBUTION_STATUSES })
  @IsOptional()
  @IsIn(DISTRIBUTION_STATUSES)
  distributionStatus?: DistributionStatus;

  @ApiPropertyOptional({ description: 'Publica el reel (moderación auto-aprobada en MVP)' })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
