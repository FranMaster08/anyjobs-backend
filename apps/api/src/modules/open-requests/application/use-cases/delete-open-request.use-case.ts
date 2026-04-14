import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';

export interface DeleteOpenRequestInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteOpenRequestUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
  ) {}

  async execute(input: DeleteOpenRequestInput): Promise<void> {
    const meta = await this.repo.findOwnerId(input.id);
    if (!meta) throw new AppException('OPEN_REQUEST.NOT_FOUND');
    if (meta.ownerUserId == null || meta.ownerUserId !== input.userId) {
      throw new ForbiddenException();
    }

    const ok = await this.repo.softDelete(input.id);
    if (!ok) throw new AppException('OPEN_REQUEST.NOT_FOUND');
  }
}
