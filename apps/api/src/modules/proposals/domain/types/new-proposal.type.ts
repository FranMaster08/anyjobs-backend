import type { Proposal } from '../interfaces/proposal.interface';

export type NewProposal = Omit<Proposal, 'id'>;

