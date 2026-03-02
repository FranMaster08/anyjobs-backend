export interface TokenServicePort {
  issueToken(subjectUserId: string): Promise<string>;
}

