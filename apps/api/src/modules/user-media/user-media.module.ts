import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMediaController } from './api/controllers/user-media.controller';
import { UserReelsController } from './api/controllers/user-reels.controller';
import { UserMediaAssetsService } from './application/user-media-assets.service';
import { UserReelsService } from './application/user-reels.service';
import { LocalUserMediaStorageProvider } from './infrastructure/adapters/local-user-media-storage.provider';
import { MediaAssetEntity } from './infrastructure/entities/media-asset.entity';
import { UserReelEntity } from './infrastructure/entities/user-reel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAssetEntity, UserReelEntity])],
  controllers: [UserMediaController, UserReelsController],
  providers: [LocalUserMediaStorageProvider, UserMediaAssetsService, UserReelsService],
  exports: [UserMediaAssetsService, UserReelsService],
})
export class UserMediaModule {}
