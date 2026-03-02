import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateWorkerProfileRequestDto {
  @ApiProperty({ example: ['Limpieza'], isArray: true, description: 'Categorías (min 1 para WORKER)' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  categories!: string[];

  @ApiPropertyOptional({ example: 'Profesional con experiencia', description: 'Titular/encabezado' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  headline?: string;

  @ApiPropertyOptional({ example: 'Trabajo rápido y cuidadoso.', description: 'Bio' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bio?: string;
}

