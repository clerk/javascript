import type { TestingTokenJSON } from './JSON';

/** The Backend `TestingToken` object holds information about a [Testing Token](https://clerk.com/docs/guides/development/testing/overview#testing-tokens). */
export class TestingToken {
  /** The token string. */
  constructor(
    readonly token: string,
    /** The timestamp when the token expires. */
    readonly expiresAt: number,
  ) {}

  static fromJSON(data: TestingTokenJSON): TestingToken {
    return new TestingToken(data.token, data.expires_at);
  }
}
