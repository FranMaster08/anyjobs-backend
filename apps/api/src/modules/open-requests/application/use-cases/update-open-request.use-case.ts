import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort, UpdateOpenRequestRecordPatch } from '../ports';
import type { OpenRequestDetail } from '../../domain';

export interface UpdateOpenRequestInput {
  id: string;
  userId: string;
  patch: UpdateOpenRequestRecordPatch;
}

@Injectable()
export class UpdateOpenRequestUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
  ) {}

  async execute(input: UpdateOpenRequestInput): Promise<OpenRequestDetail> {
    const meta = await this.repo.findOwnerId(input.id);
    if (!meta) throw new AppException('OPEN_REQUEST.NOT_FOUND');
    if (meta.ownerUserId == null || meta.ownerUserId !== input.userId) {
      throw new ForbiddenException();
    }

    const updated = await this.repo.updatePartial(input.id, input.patch);
    if (!updated) throw new AppException('OPEN_REQUEST.NOT_FOUND');
    return updated;
  }
}
