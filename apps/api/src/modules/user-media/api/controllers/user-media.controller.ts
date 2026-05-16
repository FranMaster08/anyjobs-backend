import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { UserMediaAssetsService } from '../../application/user-media-assets.service';
import { USER_MEDIA_MAX_BYTES } from '../../application/user-media-constants';
import { MediaAssetResponseDto } from '../dto/media-asset-response.dto';

type AuthedUser = { userId: string };
type AuthedRequest = Request & { user: AuthedUser };
type UploadedFilePayload = { buffer: Buffer; mimetype: string; originalname: string };

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: USER_MEDIA_MAX_BYTES },
};

@ApiTags('User Media')
@Controller('user-media')
export class UserMediaController {
  constructor(private readonly assets: UserMediaAssetsService) {}

  @RequirePermissions('user-media.upload')
  @Post('assets')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: MediaAssetResponseDto })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadAsset(
    @Req() req: AuthedRequest,
    @UploadedFile() file: UploadedFilePayload,
  ): Promise<MediaAssetResponseDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('file is required');
    }
    return this.assets.upload({
      ownerUserId: req.user.userId,
      bytes: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
  }

  @RequirePermissions('user-media.read.own')
  @Get('assets/:assetId')
  @ApiOkResponse({ type: MediaAssetResponseDto })
  async getAsset(
    @Req() req: AuthedRequest,
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<MediaAssetResponseDto> {
    return this.assets.getAssetForActor(assetId, req.user.userId);
  }
}
