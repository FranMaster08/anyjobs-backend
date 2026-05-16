import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'ACTIVE'], description: 'Estado de registro' })
  status!: 'PENDING' | 'ACTIVE';

  @ApiProperty({ example: true, description: 'Si requiere verificación de email' })
  emailVerificationRequired!: boolean;

  @ApiProperty({ example: true, description: 'Si requiere verificación de teléfono' })
  phoneVerificationRequired!: boolean;

  @ApiProperty({ example: 'VERIFY', enum: ['ACCOUNT', 'VERIFY', 'LOCATION', 'ROLE_PROFILE', 'PERSONAL_INFO', 'DONE'] })
  nextStage!: 'ACCOUNT' | 'VERIFY' | 'LOCATION' | 'ROLE_PROFILE' | 'PERSONAL_INFO' | 'DONE';

  @ApiProperty({
    example: false,
    description: 'True si se reanudó un draft de registro existente en lugar de crear uno nuevo',
  })
  resumed!: boolean;
}

