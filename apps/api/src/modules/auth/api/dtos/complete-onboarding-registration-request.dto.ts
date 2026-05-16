import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DOCUMENT_TYPES } from '../../../user-profile/domain/types/document-type.type';
import { SUPPORTED_COUNTRY_CODES } from '../../../../shared/location/supported-location.catalog';
import { ISO_COUNTRY_CODES } from '../../../../shared/location/world-countries.data';

export class CompleteOnboardingAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: [String], example: ['WORKER'] })
  @IsArray()
  @IsIn(['CLIENT', 'WORKER'], { each: true })
  roles!: Array<'CLIENT' | 'WORKER'>;
}

export class CompleteOnboardingLocationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  municipality!: string;

  @ApiProperty({ description: 'Free-text neighborhood name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  area!: string;

  @ApiProperty({ example: 'CO', enum: [...SUPPORTED_COUNTRY_CODES] })
  @IsIn([...SUPPORTED_COUNTRY_CODES])
  countryCode!: (typeof SUPPORTED_COUNTRY_CODES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coverageRadiusKm?: number;
}

export class CompleteOnboardingWorkerProfileDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}

export class CompleteOnboardingPersonalInfoDto {
  @ApiProperty({ enum: [...DOCUMENT_TYPES] })
  @IsIn([...DOCUMENT_TYPES])
  documentType!: (typeof DOCUMENT_TYPES)[number];

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(24)
  documentNumber!: string;

  @ApiProperty({ example: '1990-01-31' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  birthDate!: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] })
  @IsIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender!: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

  @ApiProperty({ example: 'CO', description: 'ISO 3166-1 alpha-2 nationality code' })
  @IsIn([...ISO_COUNTRY_CODES])
  nationality!: string;
}

export class CompleteOnboardingRegistrationRequestDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CompleteOnboardingAccountDto)
  account!: CompleteOnboardingAccountDto;

  @ApiProperty()
  @IsBoolean()
  emailVerified!: boolean;

  @ApiProperty()
  @IsBoolean()
  phoneVerified!: boolean;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CompleteOnboardingLocationDto)
  location!: CompleteOnboardingLocationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteOnboardingWorkerProfileDto)
  workerProfile?: CompleteOnboardingWorkerProfileDto;

  @ApiPropertyOptional({ enum: ['CARD', 'TRANSFER', 'CASH', 'WALLET'] })
  @IsOptional()
  @IsIn(['CARD', 'TRANSFER', 'CASH', 'WALLET'])
  preferredPaymentMethod?: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteOnboardingPersonalInfoDto)
  personalInfo?: CompleteOnboardingPersonalInfoDto;
}
