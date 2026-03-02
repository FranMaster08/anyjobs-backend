import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  RegistrationFlowState,
  RegistrationFlowStorePort,
} from '../../application/ports/registration-flow-store.port';

@Injectable()
export class InMemoryRegistrationFlowStore implements RegistrationFlowStorePort {
  private readonly flows = new Map<string, RegistrationFlowState>();

  async createFlow(userId: string): Promise<RegistrationFlowState> {
    const flow: RegistrationFlowState = {
      flowId: randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      phoneVerified: false,
    };
    this.flows.set(flow.flowId, flow);
    return flow;
  }

  async getFlow(flowId: string): Promise<RegistrationFlowState | null> {
    return this.flows.get(flowId) ?? null;
  }

  async updateFlow(
    flowId: string,
    patch: Partial<Pick<RegistrationFlowState, 'emailVerified' | 'phoneVerified'>>,
  ): Promise<void> {
    const existing = this.flows.get(flowId);
    if (!existing) return;
    this.flows.set(flowId, { ...existing, ...patch });
  }
}

