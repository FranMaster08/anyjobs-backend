import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { OpenRequestDetail } from '../../domain';

export interface GetOpenRequestDetailInput {
  id: string;
}

@Injectable()
export class GetOpenRequestDetailUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
  ) {}

  async execute(input: GetOpenRequestDetailInput): Promise<OpenRequestDetail> {
    const found = await this.repo.getById(input.id);
    if (!found) throw new AppException('OPEN_REQUEST.NOT_FOUND');
    return found;
  }
}

