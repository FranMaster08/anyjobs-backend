import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RegistrationFlowState, RegistrationFlowStorePort } from '../../application/ports/registration-flow-store.port';
import { RegistrationFlowEntity } from '../entities/registration-flow.entity';

@Injectable()
export class TypeOrmRegistrationFlowStore implements RegistrationFlowStorePort {
  constructor(@InjectRepository(RegistrationFlowEntity) private readonly repo: Repository<RegistrationFlowEntity>) {}

  async createFlow(userId: string): Promise<RegistrationFlowState> {
    const entity = this.repo.create({ userId });
    const saved = await this.repo.save(entity);
    return {
      flowId: saved.flowId,
      userId: saved.userId,
      createdAt: saved.createdAt.toISOString(),
      emailVerified: saved.emailVerified,
      phoneVerified: saved.phoneVerified,
    };
  }

  async getFlow(flowId: string): Promise<RegistrationFlowState | null> {
    const flow = await this.repo.findOne({ where: { flowId } });
    if (!flow) return null;
    return {
      flowId: flow.flowId,
      userId: flow.userId,
      createdAt: flow.createdAt.toISOString(),
      emailVerified: flow.emailVerified,
      phoneVerified: flow.phoneVerified,
    };
  }

  async updateFlow(
    flowId: string,
    patch: Partial<Pick<RegistrationFlowState, 'emailVerified' | 'phoneVerified'>>,
  ): Promise<void> {
    await this.repo.update({ flowId }, patch);
  }
}

