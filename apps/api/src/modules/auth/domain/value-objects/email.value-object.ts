export class Email {
  private constructor(private readonly normalized: string) {}

  static create(input: string): Email {
    const normalized = input.trim().toLowerCase();
    return new Email(normalized);
  }

  get value(): string {
    return this.normalized;
  }
}

