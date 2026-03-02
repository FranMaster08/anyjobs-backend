export interface CreateProposalCommand {
  requestId: string;
  userId: string;
  authorName: string;
  authorSubtitle: string;
  whoAmI: string;
  message: string;
  estimate: string;
}

