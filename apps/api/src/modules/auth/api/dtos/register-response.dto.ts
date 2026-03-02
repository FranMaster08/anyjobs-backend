import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'a0b1c2d3-e4f5-6789-aaaa-bbbbccccdddd', description: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'ACTIVE'], description: 'Estado de registro' })
  status!: 'PENDING' | 'ACTIVE';

  @ApiProperty({ example: true, description: 'Si requiere verificación de email' })
  emailVerificationRequired!: boolean;

  @ApiProperty({ example: true, description: 'Si requiere verificación de teléfono' })
  phoneVerificationRequired!: boolean;

  @ApiProperty({ example: 'VERIFY', enum: ['ACCOUNT', 'VERIFY', 'LOCATION', 'ROLE_PROFILE', 'PERSONAL_INFO', 'DONE'] })
  nextStage!: 'ACCOUNT' | 'VERIFY' | 'LOCATION' | 'ROLE_PROFILE' | 'PERSONAL_INFO' | 'DONE';
}

