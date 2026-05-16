import { Type } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

const ENGAGEMENT_KINDS = [
  'requestListImpression',
  'requestCardClick',
  'requestDetailView',
  'timeOnDetailMs',
  'proposalStarted',
] as const;

export type OpenRequestEngagementKind = (typeof ENGAGEMENT_KINDS)[number];

export class TrackOpenRequestInteractionDto {
  @IsIn([...ENGAGEMENT_KINDS])
  kind!: OpenRequestEngagementKind;

  @IsString()
  openRequestId!: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  listPage?: number;

  @IsIn(['user', 'anonymous'])
  subjectType!: 'user' | 'anonymous';

  @IsOptional()
  @ValidateIf((o: TrackOpenRequestInteractionDto) => o.subjectType === 'user' && o.userId != null)
  @IsUUID()
  userId?: string | null;

  @IsOptional()
  @IsString()
  anonymousId?: string;

  @IsOptional()
  @IsISO8601()
  emittedAt?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  viewDurationMs?: number;
}
