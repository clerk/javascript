import type { TestSessionTokenJSON } from './JSON';

/**
 * Represents a test session token resource.
 *
 * Test session tokens are used for testing purposes and allow creating sessions
 * for users without requiring full authentication flows.
 */
export class TestSessionToken {
  /**
   * Creates a new TestSessionToken instance.
   *
   * @param id - The unique identifier for the test session token
   * @param userId - The unique identifier of the user associated with this token
   * @param token - The test session token string value
   * @param status - The current status of the token: 'pending', 'accepted', or 'revoked'
   * @param url - The URL associated with the test session token
   * @param createdAt - Unix timestamp (in milliseconds) indicating when the token was created
   * @param updatedAt - Unix timestamp (in milliseconds) indicating when the token was last updated
   */
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly token: string,
    readonly status: 'pending' | 'accepted' | 'revoked',
    readonly url: string,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  /**
   * Creates a TestSessionToken instance from a JSON object.
   *
   * @param data - The JSON object containing test session token data
   * @returns A new TestSessionToken instance
   */
  static fromJSON(data: TestSessionTokenJSON): TestSessionToken {
    return new TestSessionToken(
      data.id,
      data.user_id,
      data.token,
      data.status,
      data.url,
      data.created_at,
      data.updated_at,
    );
  }
}
