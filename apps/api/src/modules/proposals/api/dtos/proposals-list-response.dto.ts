import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../../../shared/api/dtos/page-meta.dto';
import { ProposalDto } from './proposal.dto';

export class ProposalsListResponseDto {
  @ApiProperty({ type: ProposalDto, isArray: true })
  items!: ProposalDto[];

  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;
}

