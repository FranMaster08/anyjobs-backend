import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  RegistrationFlowState,
  RegistrationFlowStorePort,
} from '../../application/ports/registration-flow-store.port';

@Injectable()
export class InMemoryRegistrationFlowStore implements RegistrationFlowStorePort {
  private readonly flows = new Map<string, RegistrationFlowState>();

  async createFlow(
    input: Omit<RegistrationFlowState, 'flowId' | 'createdAt' | 'updatedAt' | 'completedAt'>,
  ): Promise<RegistrationFlowState> {
    const now = new Date().toISOString();
    const flow: RegistrationFlowState = {
      flowId: randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    this.flows.set(flow.flowId, flow);
    return flow;
  }

  async getFlow(flowId: string): Promise<RegistrationFlowState | null> {
    return this.flows.get(flowId) ?? null;
  }

  async findActiveFlowByEmail(email: string): Promise<RegistrationFlowState | null> {
    for (const flow of this.flows.values()) {
      if (flow.email === email && !flow.completedAt) return flow;
    }
    return null;
  }

  async findActiveFlowByPhoneNumber(phoneNumber: string): Promise<RegistrationFlowState | null> {
    for (const flow of this.flows.values()) {
      if (flow.phoneNumber === phoneNumber && !flow.completedAt) return flow;
    }
    return null;
  }

  async updateFlow(
    flowId: string,
    patch: Partial<Omit<RegistrationFlowState, 'flowId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<RegistrationFlowState | null> {
    const existing = this.flows.get(flowId);
    if (!existing) return null;
    const updated: RegistrationFlowState = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.flows.set(flowId, updated);
    return updated;
  }
}

