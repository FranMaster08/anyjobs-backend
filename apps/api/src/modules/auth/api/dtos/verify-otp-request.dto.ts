import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpRequestDto {
  @ApiProperty({ example: '123456', description: 'Código OTP (MVP)' })
  @IsString()
  @IsNotEmpty()
  otpCode!: string;
}

