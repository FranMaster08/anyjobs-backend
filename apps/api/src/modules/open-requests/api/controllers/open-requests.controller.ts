import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { Public } from '../../../../shared/security/public.decorator';
import { RequirePermissions } from '../../../../shared/security/require-permissions.decorator';
import { ListOpenRequestsUseCase } from '../../application/use-cases/list-open-requests.use-case';
import { ListMyOpenRequestsUseCase } from '../../application/use-cases/list-my-open-requests.use-case';
import { GetOpenRequestDetailUseCase } from '../../application/use-cases/get-open-request-detail.use-case';
import { CreateOpenRequestUseCase } from '../../application/use-cases/create-open-request.use-case';
import { UpdateOpenRequestUseCase } from '../../application/use-cases/update-open-request.use-case';
import { DeleteOpenRequestUseCase } from '../../application/use-cases/delete-open-request.use-case';
import { OpenRequestsInteractionsService } from '../../application/open-requests-interactions.service';
import { TrackOpenRequestInteractionDto } from '../dto/track-open-request-interaction.dto';
import {
  CreateOpenRequestDto,
  OpenRequestDetailDto,
  OpenRequestsListResponseDto,
  PatchOpenRequestDto,
} from '../dtos';
import {
  DeleteOpenRequestSwagger,
  GetMyOpenRequestsListSwagger,
  GetOpenRequestDetailSwagger,
  GetOpenRequestsListSwagger,
  PatchOpenRequestSwagger,
  PostOpenRequestSwagger,
} from '../swagger';
import { patchDtoToRecord } from '../mappers/patch-open-request.mapper';

type AuthedUser = { userId: string };
type AuthedRequest = Request & { user: AuthedUser };
type PublicListRequest = Request & { user?: AuthedUser };
type UploadedFile = { buffer: Buffer; mimetype: string; originalname: string };
const uploadInterceptorOptions = { storage: memoryStorage() };

@ApiTags('Open Requests')
@Controller('open-requests')
export class OpenRequestsController {
  constructor(
    private readonly listUseCase: ListOpenRequestsUseCase,
    private readonly listMineUseCase: ListMyOpenRequestsUseCase,
    private readonly detailUseCase: GetOpenRequestDetailUseCase,
    private readonly createUseCase: CreateOpenRequestUseCase,
    private readonly updateUseCase: UpdateOpenRequestUseCase,
    private readonly deleteUseCase: DeleteOpenRequestUseCase,
    private readonly interactions: OpenRequestsInteractionsService,
  ) {}

  @Public()
  @GetOpenRequestsListSwagger()
  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('anonymousId') anonymousId?: string,
    @Req() req?: PublicListRequest,
  ): Promise<OpenRequestsListResponseDto> {
    const userId = req?.user?.userId ?? this.userIdFromHeader(req);
    const res = await this.listUseCase.execute({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort,
      actor: {
        userId: userId ?? null,
        anonymousId: anonymousId ?? null,
      },
    });
    return res as unknown as OpenRequestsListResponseDto;
  }

  @RequirePermissions('open-requests.create')
  @PostOpenRequestSwagger()
  @HttpCode(201)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 6, uploadInterceptorOptions))
  async create(
    @Req() req: AuthedRequest,
    @Body() body: CreateOpenRequestDto,
    @UploadedFiles() files: UploadedFile[] = [],
  ): Promise<OpenRequestDetailDto> {
    const created = await this.createUseCase.execute({
      ownerUserId: req.user.userId,
      ...body,
      uploadedImages: files.map((file) => ({
        bytes: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      })),
    });
    return created as unknown as OpenRequestDetailDto;
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('interactions')
  async trackInteraction(@Body() body: TrackOpenRequestInteractionDto): Promise<void> {
    await this.interactions.track(body);
  }

  @RequirePermissions('open-requests.read.own')
  @GetMyOpenRequestsListSwagger()
  @Get('mine')
  async listMine(
    @Req() req: AuthedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<OpenRequestsListResponseDto> {
    const res = await this.listMineUseCase.execute({
      ownerUserId: req.user.userId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
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

  @RequirePermissions('open-requests.update')
  @PatchOpenRequestSwagger()
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 6, uploadInterceptorOptions))
  async patch(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() body: PatchOpenRequestDto,
    @UploadedFiles() files: UploadedFile[] = [],
  ): Promise<OpenRequestDetailDto> {
    const updated = await this.updateUseCase.execute({
      id,
      userId: req.user.userId,
      patch: patchDtoToRecord(body),
      uploadedImages: files.map((file) => ({
        bytes: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      })),
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

  private userIdFromHeader(req?: Request): string | null {
    const raw = req?.headers['x-user-id'];
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return null;
  }
}
