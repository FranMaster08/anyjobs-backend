import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaAssetResponseDto } from './media-asset-response.dto';

export class UserReelResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ownerUserId!: string;

  @ApiProperty()
  mediaAssetId!: string;

  @ApiPropertyOptional()
  caption?: string | null;

  @ApiProperty()
  moderationStatus!: string;

  @ApiProperty()
  distributionStatus!: string;

  @ApiPropertyOptional()
  publishedAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ type: MediaAssetResponseDto })
  media?: MediaAssetResponseDto;
}

export class UserReelListResponseDto {
  @ApiProperty({ type: [UserReelResponseDto] })
  items!: UserReelResponseDto[];
}
