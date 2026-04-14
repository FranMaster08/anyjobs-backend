import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImageDto {
  @ApiProperty({ example: 'https://picsum.photos/seed/img-1/800/600' })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({ example: 'Imagen adjunta' })
  @IsString()
  @IsNotEmpty()
  alt!: string;
}

