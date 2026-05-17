import { ApiProperty } from '@nestjs/swagger';
import { NotificationDto } from './notification.dto';

class PageMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 3 })
  totalItems!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;

  @ApiProperty({ example: false })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;
}

export class NotificationsListResponseDto {
  @ApiProperty({ type: [NotificationDto] })
  items!: NotificationDto[];

  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;
}
