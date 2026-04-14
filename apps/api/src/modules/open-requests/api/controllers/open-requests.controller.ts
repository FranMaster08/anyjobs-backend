import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../../shared/security/public.decorator';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { ListOpenRequestsUseCase } from '../../application/use-cases/list-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from '../../application/use-cases/get-open-request-detail.use-case';
import { CreateOpenRequestUseCase } from '../../application/use-cases/create-open-request.use-case';
import { UpdateOpenRequestUseCase } from '../../application/use-cases/update-open-request.use-case';
import { DeleteOpenRequestUseCase } from '../../application/use-cases/delete-open-request.use-case';
import {
  CreateOpenRequestDto,
  OpenRequestDetailDto,
  OpenRequestsListResponseDto,
  PatchOpenRequestDto,
} from '../dtos';
import {
  DeleteOpenRequestSwagger,
  GetOpenRequestDetailSwagger,
  GetOpenRequestsListSwagger,
  PatchOpenRequestSwagger,
  PostOpenRequestSwagger,
} from '../swagger';
import { patchDtoToRecord } from '../mappers/patch-open-request.mapper';

type AuthedUser = { userId: string };
type AuthedRequest = Request & { user: AuthedUser };

@ApiTags('Open Requests')
@Controller('open-requests')
export class OpenRequestsController {
  constructor(
    private readonly listUseCase: ListOpenRequestsUseCase,
    private readonly detailUseCase: GetOpenRequestDetailUseCase,
    private readonly createUseCase: CreateOpenRequestUseCase,
    private readonly updateUseCase: UpdateOpenRequestUseCase,
    private readonly deleteUseCase: DeleteOpenRequestUseCase,
  ) {}

  @Public()
  @GetOpenRequestsListSwagger()
  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
  ): Promise<OpenRequestsListResponseDto> {
    const res = await this.listUseCase.execute({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort,
    });
    return res as unknown as OpenRequestsListResponseDto;
  }

  @RequirePermissions('open-requests.create')
  @PostOpenRequestSwagger()
  @HttpCode(201)
  @Post()
  async create(@Req() req: AuthedRequest, @Body() body: CreateOpenRequestDto): Promise<OpenRequestDetailDto> {
    const created = await this.createUseCase.execute({
      ownerUserId: req.user.userId,
      ...body,
    });
    return created as unknown as OpenRequestDetailDto;
  }

  @Public()
  @GetOpenRequestDetailSwagger()
  @Get(':id')
  async detail(@Param('id') id: string): Promise<OpenRequestDetailDto> {
    const res = await this.detailUseCase.execute({ id });
    return res as unknown as OpenRequestDetailDto;
  }

  @RequirePermissions('open-requests.update')
  @PatchOpenRequestSwagger()
  @Patch(':id')
  async patch(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() body: PatchOpenRequestDto,
  ): Promise<OpenRequestDetailDto> {
    const updated = await this.updateUseCase.execute({
      id,
      userId: req.user.userId,
      patch: patchDtoToRecord(body),
    });
    return updated as unknown as OpenRequestDetailDto;
  }

  @RequirePermissions('open-requests.delete')
  @DeleteOpenRequestSwagger()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Req() req: AuthedRequest, @Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute({ id, userId: req.user.userId });
  }
}
