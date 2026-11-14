import type { HostedAuthTokenJSON } from './JSON';

export class HostedAuthToken {
  constructor(
    readonly sessionId: string,
    readonly userId: string,
    readonly sessionToken: string,
    readonly refreshToken: string | null,
  ) {}

  static fromJSON(data: HostedAuthTokenJSON): HostedAuthToken {
    return new HostedAuthToken(data.session_id, data.user_id, data.session_token, data.refresh_token ?? null);
  }
}
