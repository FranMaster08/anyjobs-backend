import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
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
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : value;
      } catch {
        return value;
      }
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  })
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
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
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

  @ApiPropertyOptional({ type: ImageDto, isArray: true, minItems: 1, maxItems: 6 })
  @Transform(({ value }) => {
    if (value == null || value === '') return undefined;
    if (Array.isArray(value)) return plainToInstance(ImageDto, value);
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return plainToInstance(ImageDto, parsed);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof (parsed as { url?: unknown }).url === 'string' &&
        typeof (parsed as { alt?: unknown }).alt === 'string'
      ) {
        return plainToInstance(ImageDto, [parsed]);
      }
      return value;
    } catch {
      return value;
    }
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
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
