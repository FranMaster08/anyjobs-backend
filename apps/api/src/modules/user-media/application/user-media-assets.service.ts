import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import type { AppConfiguration } from '../../../config/configuration';
import { resolvePublicAssetUrl } from '../../../shared/url/resolve-public-asset-url';
import { MediaAssetEntity } from '../infrastructure/entities/media-asset.entity';
import { UserReelEntity } from '../infrastructure/entities/user-reel.entity';
import { LocalUserMediaStorageProvider } from '../infrastructure/adapters/local-user-media-storage.provider';
import type { MediaAssetResponseDto } from '../api/dto/media-asset-response.dto';
import {
  USER_MEDIA_ALLOWED_MIMES,
  USER_MEDIA_MAX_BYTES,
  mediaKindFromMime,
} from './user-media-constants';

export interface UploadMediaInput {
  ownerUserId: string;
  bytes: Buffer;
  mimeType: string;
  originalName?: string;
  width?: number;
  height?: number;
  durationMs?: number;
}

@Injectable()
export class UserMediaAssetsService {
  constructor(
    @InjectRepository(MediaAssetEntity)
    private readonly assetsRepo: Repository<MediaAssetEntity>,
    @InjectRepository(UserReelEntity)
    private readonly reelsRepo: Repository<UserReelEntity>,
    private readonly storage: LocalUserMediaStorageProvider,
    private readonly configService: ConfigService<AppConfiguration>,
  ) {}

  async upload(input: UploadMediaInput): Promise<MediaAssetResponseDto> {
    this.validateUpload(input);
    const saved = await this.storage.save({
      bytes: input.bytes,
      mimeType: input.mimeType,
      originalName: input.originalName,
    });

    const entity = this.assetsRepo.create({
      ownerUserId: input.ownerUserId,
      storageKey: saved.storageKey,
      mimeType: input.mimeType,
      mediaKind: mediaKindFromMime(input.mimeType),
      status: 'ready',
      fileSizeBytes: input.bytes.length,
      width: input.width ?? null,
      height: input.height ?? null,
      durationMs: input.durationMs ?? null,
    });

    const row = await this.assetsRepo.save(entity);
    return this.toDto(row);
  }

  async getAssetForActor(assetId: string, actorUserId: string): Promise<MediaAssetResponseDto> {
    const asset = await this.assetsRepo.findOne({ where: { id: assetId } });
    if (!asset) throw new NotFoundException();

    if (asset.ownerUserId === actorUserId) {
      return this.toDto(asset);
    }

    const publicReel = await this.reelsRepo.findOne({
      where: {
        mediaAssetId: assetId,
        moderationStatus: 'approved',
      },
    });
    if (!publicReel || publicReel.distributionStatus === 'draft') {
      throw new ForbiddenException();
    }

    return this.toDto(asset);
  }

  private validateUpload(input: UploadMediaInput): void {
    if (!USER_MEDIA_ALLOWED_MIMES.has(input.mimeType)) {
      throw new BadRequestException(`MIME type not allowed: ${input.mimeType}`);
    }
    if (input.bytes.length > USER_MEDIA_MAX_BYTES) {
      throw new BadRequestException('File exceeds maximum size (50 MB)');
    }
    if (input.bytes.length === 0) {
      throw new BadRequestException('Empty file');
    }
  }

  private toDto(entity: MediaAssetEntity): MediaAssetResponseDto {
    const publicBaseUrl = this.configService.getOrThrow<AppConfiguration['app']>('app').publicUrl;
    return {
      id: entity.id,
      ownerUserId: entity.ownerUserId,
      mediaUrl: resolvePublicAssetUrl(publicBaseUrl, this.storage.resolveUrl(entity.storageKey)),
      mimeType: entity.mimeType,
      mediaKind: entity.mediaKind,
      status: entity.status,
      fileSizeBytes: entity.fileSizeBytes,
      width: entity.width,
      height: entity.height,
      durationMs: entity.durationMs,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
