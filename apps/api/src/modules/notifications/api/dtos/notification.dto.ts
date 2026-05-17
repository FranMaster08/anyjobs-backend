import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ example: 'notif-1' })
  id!: string;

  @ApiProperty({ example: 'PROPOSAL_RECEIVED' })
  type!: string;

  @ApiProperty({ example: 'Nueva postulación' })
  title!: string;

  @ApiProperty({ example: 'Alguien se postuló a tu solicitud.' })
  message!: string;

  @ApiProperty({ example: 'open_request' })
  entityType!: string;

  @ApiProperty({ example: 'req-1' })
  entityId!: string;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiProperty({ example: '2026-05-17T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-17T12:00:00.000Z' })
  updatedAt!: string;
}
