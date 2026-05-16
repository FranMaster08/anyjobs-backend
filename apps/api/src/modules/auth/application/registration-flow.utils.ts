import type { RegistrationFlowState } from './ports/registration-flow-store.port';

export function isRegistrationFlowActive(flow: Pick<RegistrationFlowState, 'completedAt' | 'expiresAt'>): boolean {
  if (flow.completedAt) return false;
  if (flow.expiresAt) {
    const expires = new Date(flow.expiresAt).getTime();
    if (!Number.isNaN(expires) && expires < Date.now()) return false;
  }
  return true;
}
