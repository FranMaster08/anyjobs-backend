import type { ProposalAuthor } from './proposal-author.interface';
import type { ProposalStatus } from '../types/proposal-status.type';

export interface Proposal {
  id: string;
  requestId: string;
  userId: string;
  author: ProposalAuthor;
  whoAmI: string;
  message: string;
  estimate: string;
  createdAt: string; // ISO
  status: ProposalStatus;
}

