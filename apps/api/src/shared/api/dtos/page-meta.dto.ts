import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty({ example: 120 })
  totalItems!: number;

  @ApiProperty({ example: 1, description: '1-based page number' })
  page!: number;

  @ApiProperty({ example: 12 })
  pageSize!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;

  @ApiProperty({ example: 2, nullable: true })
  nextPage!: number | null;

  @ApiProperty({ example: null, nullable: true })
  previousPage!: number | null;
}

