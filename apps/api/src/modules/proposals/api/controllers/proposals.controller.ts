import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { ListProposalsUseCase } from '../../application/use-cases/list-proposals.use-case';
import { CreateProposalUseCase } from '../../application/use-cases/create-proposal.use-case';
import { CreateProposalRequestDto, ProposalDto, ProposalsListResponseDto } from '../dtos';
import { GetProposalsSwagger, PostProposalsSwagger } from '../swagger';

@ApiTags('Proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly listUseCase: ListProposalsUseCase,
    private readonly createUseCase: CreateProposalUseCase,
  ) {}

  @RequirePermissions('proposals.read')
  @GetProposalsSwagger()
  @Get()
  async list(
    @Query('userId') userId?: string,
    @Query('requestId') requestId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<ProposalsListResponseDto> {
    const res = await this.listUseCase.execute({
      userId,
      requestId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return res as unknown as ProposalsListResponseDto;
  }

  @RequirePermissions('proposals.create')
  @PostProposalsSwagger()
  @Post()
  async create(@Body() body: CreateProposalRequestDto): Promise<ProposalDto> {
    const created = await this.createUseCase.execute(body);
    return created as unknown as ProposalDto;
  }
}

