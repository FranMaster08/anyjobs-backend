import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../../../shared/api/dtos/page-meta.dto';
import { OpenRequestListItemDto } from './open-request-list-item.dto';

export class OpenRequestsListResponseDto {
  @ApiProperty({ type: OpenRequestListItemDto, isArray: true })
  items!: OpenRequestListItemDto[];

  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;

  // Compat MVP (front actual)
  @ApiProperty({ example: 2, nullable: true, description: 'Siguiente página (compat)' })
  nextPage!: number | null;

  @ApiProperty({ example: true, description: 'Indica si hay más (compat)' })
  hasMore!: boolean;
}

