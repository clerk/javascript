import type {
  ActClaim,
  SessionActivity,
  SessionActivityJSON,
  SessionWithActivitiesJSON,
  SessionWithActivitiesResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

const mapSessionActivityJSONToSessionActivity = (data: SessionActivityJSON): SessionActivity => ({
  id: data.id,
  deviceType: data.device_type,
  browserName: data.browser_name,
  browserVersion: data.browser_version,
  country: data.country,
  city: data.city,
  isMobile: data.is_mobile,
  ipAddress: data.ip_address,
});

export class SessionWithActivities extends BaseResource implements SessionWithActivitiesResource {
  pathRoot = '';
  id!: string;
  status!: string;
  abandonAt!: Date;
  expireAt!: Date;
  lastActiveAt!: Date;
  latestActivity!: SessionActivity;
  actor!: ActClaim | null;

  constructor(data: SessionWithActivitiesJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  static retrieve(): Promise<SessionWithActivities[]> {
    const sessionId = BaseResource.clerk.session?.id;

    return this.clerk
      .getFapiClient()
      .request<SessionWithActivitiesJSON[]>({
        method: 'GET',
        path: '/me/sessions/active',
        sessionId,
      })
      .then(res => {
        // https://www.notion.so/clerkdev/Align-SessionWithActivities-retrieval-with-the-rest-of-Client-API-a043f72f6b9d4344bd2f21dc1d3f79de
        const sessionWithActivitiesJSON = res.payload as unknown as SessionWithActivitiesJSON[];
        return sessionWithActivitiesJSON.map(sa => new SessionWithActivities(sa, '/me/sessions'));
      })
      .catch(() => []);
  }

  revoke(): Promise<this> {
    return this._basePost({ action: 'revoke', body: {} });
  }

  protected fromJSON(data: SessionWithActivitiesJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.expireAt = unixEpochToDate(data.expire_at);
    this.abandonAt = unixEpochToDate(data.abandon_at);
    this.lastActiveAt = unixEpochToDate(data.last_active_at || undefined);
    this.latestActivity = mapSessionActivityJSONToSessionActivity(data.latest_activity ?? ({} as SessionActivityJSON));
    this.actor = data.actor;
    return this;
  }
}
