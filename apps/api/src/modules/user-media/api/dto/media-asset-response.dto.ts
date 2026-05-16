import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MediaAssetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ownerUserId!: string;

  @ApiProperty()
  mediaUrl!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty({ enum: ['image', 'video'] })
  mediaKind!: 'image' | 'video';

  @ApiProperty({ enum: ['uploading', 'ready', 'failed'] })
  status!: string;

  @ApiProperty()
  fileSizeBytes!: number;

  @ApiPropertyOptional()
  width?: number | null;

  @ApiPropertyOptional()
  height?: number | null;

  @ApiPropertyOptional()
  durationMs?: number | null;

  @ApiProperty()
  createdAt!: string;
}
