export class PhoneNumber {
  private constructor(private readonly normalized: string) {}

  static create(input: string): PhoneNumber {
    const normalized = input.trim();
    return new PhoneNumber(normalized);
  }

  get value(): string {
    return this.normalized;
  }
}

