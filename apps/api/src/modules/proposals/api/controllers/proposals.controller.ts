import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { ListProposalsUseCase } from '../../application/use-cases/list-proposals.use-case';
import { CreateProposalUseCase } from '../../application/use-cases/create-proposal.use-case';
import { CreateProposalRequestDto, ProposalDto, ProposalsListResponseDto } from '../dtos';
import { GetProposalsSwagger, PostProposalsSwagger } from '../swagger';

type AuthedRequest = Request & { user: { userId: string } };

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
    @Req() req: AuthedRequest,
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
      viewerUserId: req.user.userId,
    });
    return res as unknown as ProposalsListResponseDto;
  }

  @RequirePermissions('proposals.create')
  @PostProposalsSwagger()
  @Post()
  async create(@Req() req: AuthedRequest, @Body() body: CreateProposalRequestDto): Promise<ProposalDto> {
    const created = await this.createUseCase.execute({
      ...body,
      userId: req.user.userId,
    });
    return created as unknown as ProposalDto;
  }
}
