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
import {
  UserReelEntity,
  type DistributionStatus,
} from '../infrastructure/entities/user-reel.entity';
import { LocalUserMediaStorageProvider } from '../infrastructure/adapters/local-user-media-storage.provider';
import type { CreateUserReelDto } from '../api/dto/create-user-reel.dto';
import type { UpdateUserReelDto } from '../api/dto/update-user-reel.dto';
import type { UserReelListResponseDto, UserReelResponseDto } from '../api/dto/user-reel-response.dto';
import type { MediaAssetResponseDto } from '../api/dto/media-asset-response.dto';

@Injectable()
export class UserReelsService {
  constructor(
    @InjectRepository(UserReelEntity)
    private readonly reelsRepo: Repository<UserReelEntity>,
    @InjectRepository(MediaAssetEntity)
    private readonly assetsRepo: Repository<MediaAssetEntity>,
    private readonly storage: LocalUserMediaStorageProvider,
    private readonly configService: ConfigService<AppConfiguration>,
  ) {}

  async create(ownerUserId: string, dto: CreateUserReelDto): Promise<UserReelResponseDto> {
    const asset = await this.assetsRepo.findOne({ where: { id: dto.mediaAssetId } });
    if (!asset || asset.ownerUserId !== ownerUserId) {
      throw new ForbiddenException();
    }
    if (asset.status !== 'ready') {
      throw new BadRequestException('Media asset is not ready');
    }

    const reel = this.reelsRepo.create({
      ownerUserId,
      mediaAssetId: asset.id,
      caption: dto.caption?.trim() || null,
      moderationStatus: 'pending',
      distributionStatus: 'draft',
      publishedAt: null,
    });
    const saved = await this.reelsRepo.save(reel);
    return this.toDto(saved, asset);
  }

  async listMine(ownerUserId: string): Promise<UserReelListResponseDto> {
    const reels = await this.reelsRepo.find({
      where: { ownerUserId },
      relations: ['mediaAsset'],
      order: { createdAt: 'DESC' },
    });
    return {
      items: reels.map((r) => this.toDto(r, r.mediaAsset!)),
    };
  }

  async listPublicForUser(profileUserId: string): Promise<UserReelListResponseDto> {
    const reels = await this.reelsRepo.find({
      where: {
        ownerUserId: profileUserId,
        moderationStatus: 'approved',
      },
      relations: ['mediaAsset'],
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    });

    const visible = reels.filter((r) => r.distributionStatus !== 'draft');
    return {
      items: visible.map((r) => this.toDto(r, r.mediaAsset!)),
    };
  }

  async update(
    ownerUserId: string,
    reelId: string,
    dto: UpdateUserReelDto,
  ): Promise<UserReelResponseDto> {
    const reel = await this.loadOwnedReel(ownerUserId, reelId);
    const asset = await this.assetsRepo.findOneOrFail({ where: { id: reel.mediaAssetId } });

    if (dto.caption !== undefined) {
      reel.caption = dto.caption.trim() || null;
    }

    if (dto.publish === true) {
      if (asset.status !== 'ready') {
        throw new BadRequestException('Media asset is not ready');
      }
      reel.moderationStatus = 'approved';
      reel.distributionStatus = dto.distributionStatus ?? 'testing';
      reel.publishedAt = reel.publishedAt ?? new Date();
    } else if (dto.distributionStatus !== undefined) {
      reel.distributionStatus = dto.distributionStatus;
      if (this.isPublicDistribution(dto.distributionStatus)) {
        reel.moderationStatus = 'approved';
        reel.publishedAt = reel.publishedAt ?? new Date();
      }
    }

    const saved = await this.reelsRepo.save(reel);
    return this.toDto(saved, asset);
  }

  async delete(ownerUserId: string, reelId: string): Promise<void> {
    const reel = await this.loadOwnedReel(ownerUserId, reelId);
    await this.reelsRepo.remove(reel);
  }

  private async loadOwnedReel(ownerUserId: string, reelId: string): Promise<UserReelEntity> {
    const reel = await this.reelsRepo.findOne({
      where: { id: reelId },
      relations: ['mediaAsset'],
    });
    if (!reel) throw new NotFoundException();
    if (reel.ownerUserId !== ownerUserId) throw new ForbiddenException();
    return reel;
  }

  private isPublicDistribution(status: DistributionStatus): boolean {
    return status === 'testing' || status === 'scaling' || status === 'paused';
  }

  private toDto(reel: UserReelEntity, asset: MediaAssetEntity): UserReelResponseDto {
    return {
      id: reel.id,
      ownerUserId: reel.ownerUserId,
      mediaAssetId: reel.mediaAssetId,
      caption: reel.caption,
      moderationStatus: reel.moderationStatus,
      distributionStatus: reel.distributionStatus,
      publishedAt: reel.publishedAt?.toISOString() ?? null,
      createdAt: reel.createdAt.toISOString(),
      media: this.assetToDto(asset),
    };
  }

  private assetToDto(entity: MediaAssetEntity): MediaAssetResponseDto {
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
