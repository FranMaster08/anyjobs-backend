import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../../shared/security/public.decorator';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { UserReelsService } from '../../application/user-reels.service';
import { CreateUserReelDto } from '../dto/create-user-reel.dto';
import { UpdateUserReelDto } from '../dto/update-user-reel.dto';
import { UserReelListResponseDto, UserReelResponseDto } from '../dto/user-reel-response.dto';

type AuthedUser = { userId: string };
type AuthedRequest = Request & { user: AuthedUser };

@ApiTags('User Reels')
@Controller()
export class UserReelsController {
  constructor(private readonly reels: UserReelsService) {}

  @RequirePermissions('user-reels.manage.own')
  @Post('user-reels')
  @HttpCode(201)
  @ApiCreatedResponse({ type: UserReelResponseDto })
  async create(@Req() req: AuthedRequest, @Body() body: CreateUserReelDto): Promise<UserReelResponseDto> {
    return this.reels.create(req.user.userId, body);
  }

  @RequirePermissions('user-reels.manage.own')
  @Get('user-reels/me')
  @ApiOkResponse({ type: UserReelListResponseDto })
  async listMine(@Req() req: AuthedRequest): Promise<UserReelListResponseDto> {
    return this.reels.listMine(req.user.userId);
  }

  @RequirePermissions('user-reels.manage.own')
  @Patch('user-reels/:reelId')
  @ApiOkResponse({ type: UserReelResponseDto })
  async update(
    @Req() req: AuthedRequest,
    @Param('reelId', ParseUUIDPipe) reelId: string,
    @Body() body: UpdateUserReelDto,
  ): Promise<UserReelResponseDto> {
    return this.reels.update(req.user.userId, reelId, body);
  }

  @RequirePermissions('user-reels.manage.own')
  @Delete('user-reels/:reelId')
  @HttpCode(204)
  async delete(
    @Req() req: AuthedRequest,
    @Param('reelId', ParseUUIDPipe) reelId: string,
  ): Promise<void> {
    await this.reels.delete(req.user.userId, reelId);
  }

  @Public()
  @Get('users/:userId/reels')
  @ApiOkResponse({ type: UserReelListResponseDto })
  async listPublic(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserReelListResponseDto> {
    return this.reels.listPublicForUser(userId);
  }
}
