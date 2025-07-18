import type { ActorTokenStatus } from './Enums';
import type { ActorTokenJSON } from './JSON';

export class ActorToken {
  constructor(
    readonly id: string,
    readonly status: ActorTokenStatus,
    readonly userId: string,
    readonly actor: Record<string, unknown> | null,
    readonly token: string | null | undefined,
    readonly url: string | null | undefined,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: ActorTokenJSON): ActorToken {
    return new ActorToken(
      data.id,
      data.status,
      data.user_id,
      data.actor,
      data.token,
      data.url,
      data.created_at,
      data.updated_at,
    );
  }
}
