import type { SessionActivityJSON, SessionJSON } from './JSON';

export class SessionActivity {
  constructor(
    readonly id: string,
    readonly isMobile: boolean,
    readonly ipAddress?: string,
    readonly city?: string,
    readonly country?: string,
    readonly browserVersion?: string,
    readonly browserName?: string,
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
    readonly lastActiveOrganizationId?: string,
    readonly latestActivity?: SessionActivity,
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
