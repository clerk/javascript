import type { SignInTokenJSON } from './JSON';

export class SignInToken {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly token: string,
    readonly status: string,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: SignInTokenJSON): SignInToken {
    return new SignInToken(data.id, data.user_id, data.token, data.status, data.created_at, data.updated_at);
  }
}
