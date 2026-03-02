export interface RegistrationFlowState {
  flowId: string;
  userId: string;
  createdAt: string; // ISO
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface RegistrationFlowStorePort {
  createFlow(userId: string): Promise<RegistrationFlowState>;
  getFlow(flowId: string): Promise<RegistrationFlowState | null>;
  updateFlow(flowId: string, patch: Partial<Pick<RegistrationFlowState, 'emailVerified' | 'phoneVerified'>>): Promise<void>;
}

