import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ImageDto } from './image.dto';
import { ProviderDto } from './provider.dto';
import { ProviderReviewDto } from './provider-review.dto';

export class CreateOpenRequestDto {
  @ApiProperty({ example: 'Limpieza profunda de piso' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Necesito una limpieza profunda.' })
  @IsString()
  @IsNotEmpty()
  excerpt!: string;

  @ApiProperty({ example: 'Descripción completa del trabajo.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: ['Limpieza'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({ example: 'Barcelona · Eixample' })
  @IsString()
  @IsNotEmpty()
  locationLabel!: string;

  @ApiProperty({ example: '€60' })
  @IsString()
  @IsNotEmpty()
  budgetLabel!: string;

  @ApiProperty({ example: '+34600111222' })
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @ApiProperty({ example: 'contacto@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  contactEmail!: string;

  @ApiPropertyOptional({ example: 'Recién publicado' })
  @IsOptional()
  @IsString()
  publishedAtLabel?: string;

  @ApiPropertyOptional({ example: 'https://picsum.photos/seed/new/640/360' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Imagen de la solicitud' })
  @IsOptional()
  @IsString()
  imageAlt?: string;

  @ApiPropertyOptional({ type: ImageDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @ApiPropertyOptional({ type: ProviderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProviderDto)
  provider?: ProviderDto;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  reputation?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  reviewsCount?: number;

  @ApiPropertyOptional({ type: ProviderReviewDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderReviewDto)
  providerReviews?: ProviderReviewDto[];
}
