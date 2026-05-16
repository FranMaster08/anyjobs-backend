import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrationStatusResponseDto {
  @ApiProperty({ example: true })
  active!: boolean;

  @ApiPropertyOptional({ enum: ['PENDING', 'ACTIVE'] })
  status?: 'PENDING' | 'ACTIVE';

  @ApiPropertyOptional({ enum: ['ACCOUNT', 'VERIFY', 'LOCATION', 'ROLE_PROFILE', 'PERSONAL_INFO', 'DONE'] })
  nextStage?: 'ACCOUNT' | 'VERIFY' | 'LOCATION' | 'ROLE_PROFILE' | 'PERSONAL_INFO' | 'DONE';

  @ApiPropertyOptional({ type: [String], example: ['WORKER'] })
  roles?: Array<'CLIENT' | 'WORKER'>;

  @ApiPropertyOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  phoneVerified?: boolean;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  fullName?: string;
}
