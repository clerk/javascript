import type { TestingTokenJSON } from './JSON';

export class TestingToken {
  constructor(
    readonly token: string,
    readonly expiresAt: number,
  ) {}

  static fromJSON(data: TestingTokenJSON): TestingToken {
    return new TestingToken(data.token, data.expires_at);
  }
}
