import { ApiProperty } from '@nestjs/swagger';
import { ProposalAuthorDto } from './proposal-author.dto';

export class ProposalDto {
  @ApiProperty({ example: 'prop-1' })
  id!: string;

  @ApiProperty({ example: 'req-1' })
  requestId!: string;

  @ApiProperty({ example: 'user-1' })
  userId!: string;

  @ApiProperty({ type: ProposalAuthorDto })
  author!: ProposalAuthorDto;

  @ApiProperty({ example: 'Soy profesional de limpieza...' })
  whoAmI!: string;

  @ApiProperty({ example: 'Puedo hacerlo esta semana.' })
  message!: string;

  @ApiProperty({ example: '€60' })
  estimate!: string;

  @ApiProperty({ example: '2026-03-01T18:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: 'SENT', enum: ['SENT'] })
  status!: 'SENT';
}

