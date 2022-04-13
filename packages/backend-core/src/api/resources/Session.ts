import type { SessionJSON } from './JSON';

export class Session {
  constructor(
    readonly id: string,
    readonly clientId: string,
    readonly userId: string,
    readonly status: string,
    readonly lastActiveAt: number,
    readonly expireAt: number,
    readonly abandonAt: number,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: SessionJSON): Session {
    return new Session(
      data.id,
      data.client_id,
      data.user_id,
      data.status,
      data.last_active_at,
      data.expire_at,
      data.abandon_at,
      data.created_at,
      data.updated_at,
    );
  }
}
