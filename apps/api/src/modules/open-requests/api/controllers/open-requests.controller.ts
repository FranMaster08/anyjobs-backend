import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/security/public.decorator';
import { ListOpenRequestsUseCase } from '../../application/use-cases/list-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from '../../application/use-cases/get-open-request-detail.use-case';
import { OpenRequestDetailDto, OpenRequestsListResponseDto } from '../dtos';
import { GetOpenRequestDetailSwagger, GetOpenRequestsListSwagger } from '../swagger';

@ApiTags('Open Requests')
@Controller('open-requests')
export class OpenRequestsController {
  constructor(
    private readonly listUseCase: ListOpenRequestsUseCase,
    private readonly detailUseCase: GetOpenRequestDetailUseCase,
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

  @Public()
  @GetOpenRequestDetailSwagger()
  @Get(':id')
  async detail(@Param('id') id: string): Promise<OpenRequestDetailDto> {
    const res = await this.detailUseCase.execute({ id });
    return res as unknown as OpenRequestDetailDto;
  }
}

