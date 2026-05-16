import { TrackPromoInteractionDto } from '../../../promo-slides/api/dto/track-promo-interaction.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class TrackUserReelInteractionDto extends TrackPromoInteractionDto {
  @IsOptional()
  @IsUUID()
  reelId?: string;

  /** Alias aceptado desde clientes que reutilizan payload promo con campaignId */
  @IsOptional()
  @IsString()
  campaignId?: string;
}
