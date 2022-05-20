import type { ClientJSON } from './JSON';
import { Session } from './Session';

export class Client {
  constructor(
    readonly id: string,
    readonly sessionIds: string[],
    readonly sessions: Session[],
    readonly signInAttemptId: string | null,
    readonly signUpAttemptId: string | null,
    readonly signInId: string | null,
    readonly signUpId: string | null,
    readonly lastActiveSessionId: string | null,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: ClientJSON): Client {
    return new Client(
      data.id,
      data.session_ids,
      data.sessions.map(x => Session.fromJSON(x)),
      data.sign_in_attempt_id,
      data.sign_up_attempt_id,
      data.sign_in_id,
      data.sign_up_id,
      data.last_active_session_id,
      data.created_at,
      data.updated_at,
    );
  }
}
