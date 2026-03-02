import { ApiProperty } from '@nestjs/swagger';

export class ImageDto {
  @ApiProperty({ example: 'https://picsum.photos/seed/img-1/800/600' })
  url!: string;

  @ApiProperty({ example: 'Imagen adjunta' })
  alt!: string;
}

