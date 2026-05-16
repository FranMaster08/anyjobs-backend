import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedReelsController } from './api/controllers/feed-reels.controller';
import { UserMediaController } from './api/controllers/user-media.controller';
import { UserReelsController } from './api/controllers/user-reels.controller';
import { UserMediaAssetsService } from './application/user-media-assets.service';
import { UserReelInteractionsService } from './application/user-reel-interactions.service';
import { UserReelMetricsService } from './application/user-reel-metrics.service';
import { UserReelsFeedRankingService } from './application/user-reels-feed-ranking.service';
import { UserReelsService } from './application/user-reels.service';
import { LocalUserMediaStorageProvider } from './infrastructure/adapters/local-user-media-storage.provider';
import { MediaAssetEntity } from './infrastructure/entities/media-asset.entity';
import { UserReelInteractionEntity } from './infrastructure/entities/user-reel-interaction.entity';
import { UserReelEntity } from './infrastructure/entities/user-reel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAssetEntity, UserReelEntity, UserReelInteractionEntity]),
  ],
  controllers: [UserMediaController, UserReelsController, FeedReelsController],
  providers: [
    LocalUserMediaStorageProvider,
    UserMediaAssetsService,
    UserReelsService,
    UserReelInteractionsService,
    UserReelMetricsService,
    UserReelsFeedRankingService,
  ],
  exports: [
    UserMediaAssetsService,
    UserReelsService,
    UserReelInteractionsService,
    UserReelsFeedRankingService,
  ],
})
export class UserMediaModule {}
