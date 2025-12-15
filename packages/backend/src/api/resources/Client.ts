import type { LastAuthenticationStrategy } from '@clerk/shared/types';

import type { ClientJSON } from './JSON';
import { Session } from './Session';

/**
 * The Backend `Client` object is similar to the [`Client`](https://clerk.com/docs/reference/javascript/client) object as it holds information about the authenticated sessions in the current device. However, the Backend `Client` object is different from the `Client` object in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Clients#operation/GetClient) and is not directly accessible from the Frontend API.
 */
export class Client {
  constructor(
    /**
     * The unique identifier for the `Client`.
     */
    readonly id: string,
    /**
     * An array of [Session](https://clerk.com/docs/reference/backend/types/backend-session){{ target: '_blank' }} IDs associated with the `Client`.
     */
    readonly sessionIds: string[],
    /**
     * An array of [Session](https://clerk.com/docs/reference/backend/types/backend-session){{ target: '_blank' }} objects associated with the `Client`.
     */
    readonly sessions: Session[],
    /**
     * The ID of the [`SignIn`](https://clerk.com/docs/reference/javascript/sign-in){{ target: '_blank' }}.
     */
    readonly signInId: string | null,
    /**
     * The ID of the [`SignUp`](https://clerk.com/docs/reference/javascript/sign-up){{ target: '_blank' }}.
     */
    readonly signUpId: string | null,
    /**
     * The ID of the last active [Session](https://clerk.com/docs/reference/backend/types/backend-session).
     */
    readonly lastActiveSessionId: string | null,
    /**
     * The last authentication strategy used by the `Client`.
     */
    readonly lastAuthenticationStrategy: LastAuthenticationStrategy | null,
    /**
     * The date when the `Client` was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the `Client` was last updated.
     */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: ClientJSON): Client {
    return new Client(
      data.id,
      data.session_ids,
      data.sessions.map(x => Session.fromJSON(x)),
      data.sign_in_id,
      data.sign_up_id,
      data.last_active_session_id,
      data.last_authentication_strategy,
      data.created_at,
      data.updated_at,
    );
  }
}
