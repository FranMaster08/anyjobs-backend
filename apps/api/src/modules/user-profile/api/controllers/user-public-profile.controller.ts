import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/security/public.decorator';
import { UserPublicProfileResponseDto } from '../dtos';
import { UserProfileReadService } from '../../application/user-profile-read.service';

@ApiTags('Users')
@Controller('users')
export class UserPublicProfileController {
  constructor(private readonly profileRead: UserProfileReadService) {}

  @Public()
  @Get('profile/:userId')
  @ApiOperation({ summary: 'Perfil público de un usuario (sin datos sensibles)' })
  @ApiOkResponse({ type: UserPublicProfileResponseDto })
  async getPublicProfile(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserPublicProfileResponseDto> {
    return this.profileRead.getPublicProfile(userId);
  }
}
