import type { TestSessionTokenJSON } from './JSON';

export class TestSessionToken {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly token: string,
    readonly status: 'pending' | 'accepted' | 'revoked',
    readonly url: string,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

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
