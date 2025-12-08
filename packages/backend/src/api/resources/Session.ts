import type { SessionActivityJSON, SessionJSON } from './JSON';

/**
 * The Backend `SessionActivity` object models the activity of a user session, capturing details such as the device type, browser information, and geographical location.
 */
export class SessionActivity {
  constructor(
    /**
     * The unique identifier for the session activity record.
     */
    readonly id: string,
    /**
     * Will be set to `true` if the session activity came from a mobile device. Set to `false` otherwise.
     */
    readonly isMobile: boolean,
    /**
     * The IP address from which this session activity originated.
     */
    readonly ipAddress?: string,
    /**
     * The city from which this session activity occurred. Resolved by IP address geo-location.
     */
    readonly city?: string,
    /**
     * The country from which this session activity occurred. Resolved by IP address geo-location.
     */
    readonly country?: string,
    /**
     * The version of the browser from which this session activity occurred.
     */
    readonly browserVersion?: string,
    /**
     * The name of the browser from which this session activity occurred.
     */
    readonly browserName?: string,
    /**
     * The type of the device which was used in this session activity.
     */
    readonly deviceType?: string,
  ) {}

  static fromJSON(data: SessionActivityJSON): SessionActivity {
    return new SessionActivity(
      data.id,
      data.is_mobile,
      data.ip_address,
      data.city,
      data.country,
      data.browser_version,
      data.browser_name,
      data.device_type,
    );
  }
}

/**
 * The Backend `Session` object is similar to the [`Session`](https://clerk.com/docs/reference/javascript/session) object as it is an abstraction over an HTTP session and models the period of information exchange between a user and the server. However, the Backend `Session` object is different as it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Sessions#operation/GetSessionList) and is not directly accessible from the Frontend API.
 */
export class Session {
  constructor(
    /**
     * The unique identifier for the `Session`.
     */
    readonly id: string,
    /**
     * The ID of the client associated with the `Session`.
     */
    readonly clientId: string,
    /**
     * The ID of the user associated with the `Session`.
     */
    readonly userId: string,
    /**
     * The current state of the `Session`.
     */
    readonly status: string,
    /**
     * The time the session was last active on the [`Client`](https://clerk.com/docs/reference/backend/types/backend-client).
     */
    readonly lastActiveAt: number,
    /**
     * The date when the `Session` will expire.
     */
    readonly expireAt: number,
    /**
     * The date when the `Session` will be abandoned.
     */
    readonly abandonAt: number,
    /**
     * The date when the `Session` was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the `Session` was last updated.
     */
    readonly updatedAt: number,
    /**
     * The ID of the last active Organization.
     */
    readonly lastActiveOrganizationId?: string,
    /**
     * An object that provides additional information about this session, focused around user activity data.
     */
    readonly latestActivity?: SessionActivity,
    /**
     * The JWT actor for the session. Holds identifier for the user that is impersonating the current user. Read more about [impersonation](https://clerk.com/docs/guides/users/impersonation).
     */
    readonly actor: Record<string, unknown> | null = null,
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
      data.last_active_organization_id,
      data.latest_activity && SessionActivity.fromJSON(data.latest_activity),
      data.actor,
    );
  }
}
