export interface RegistrationFlowState {
  flowId: string;
  userId?: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  expiresAt?: string; // ISO
  completedAt?: string; // ISO
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  roles: Array<'CLIENT' | 'WORKER'>;
  status: 'PENDING' | 'ACTIVE';
  nextStage: 'ACCOUNT' | 'VERIFY' | 'LOCATION' | 'ROLE_PROFILE' | 'PERSONAL_INFO' | 'DONE';
  emailVerified: boolean;
  phoneVerified: boolean;
  countryCode?: string;
  city?: string;
  area?: string;
  coverageRadiusKm?: number;
  workerCategories?: string[];
  workerHeadline?: string;
  workerBio?: string;
  preferredPaymentMethod?: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';
  documentType?: 'DNI' | 'NIE' | 'PASSPORT';
  documentNumber?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
}

export interface RegistrationFlowStorePort {
  createFlow(
    input: Omit<RegistrationFlowState, 'flowId' | 'createdAt' | 'updatedAt' | 'completedAt'>,
  ): Promise<RegistrationFlowState>;
  getFlow(flowId: string): Promise<RegistrationFlowState | null>;
  findActiveFlowByEmail(email: string): Promise<RegistrationFlowState | null>;
  findActiveFlowByPhoneNumber(phoneNumber: string): Promise<RegistrationFlowState | null>;
  updateFlow(
    flowId: string,
    patch: Partial<Omit<RegistrationFlowState, 'flowId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<RegistrationFlowState | null>;
}

