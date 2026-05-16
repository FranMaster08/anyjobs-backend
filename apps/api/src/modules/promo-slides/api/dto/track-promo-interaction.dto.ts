import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class TrackPromoInteractionDto {
  @IsString()
  kind!: string;

  @IsOptional()
  @IsString()
  sliderId?: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  slideIndex?: number;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  slideMedia?: string;

  @IsIn(['user', 'anonymous'])
  subjectType!: 'user' | 'anonymous';

  @IsOptional()
  @ValidateIf((o: TrackPromoInteractionDto) => o.subjectType === 'user' && o.userId != null)
  @IsString()
  userId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userRoles?: string[];

  @IsOptional()
  @IsString()
  anonymousId?: string;

  @IsOptional()
  @IsISO8601()
  emittedAt?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  /** Campos adicionales del evento (action, muted, watchMs, etc.) */
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  muted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  watchMs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mediaDurationMs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  completionRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  viewDurationMs?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  count?: string;

  @IsOptional()
  @IsBoolean()
  following?: boolean;

  @IsOptional()
  @IsBoolean()
  final?: boolean;
}
