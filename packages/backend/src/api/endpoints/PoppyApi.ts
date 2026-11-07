import type { RequestFunction } from '../request';
import { AbstractAPI } from './AbstractApi';

const browserSessions = '/poppy/browser_sessions';

export type PoppyBrowserSession = {
  session_id: string;
  client_id: string;
  user_id: string;
  agent_id?: string;
  replaced_sign_in?: boolean;
  account?: { user_id: string; scopes: string[]; session_id: string };
};

export class PoppyAPI extends AbstractAPI {
  constructor(
    request: RequestFunction,
    private readonly frontendApi?: string,
  ) {
    super(request);
  }

  public get browserCompletionUrl() {
    if (!this.frontendApi) {
      throw new Error('A valid Clerk publishable key is required for Poppy browser sessions.');
    }
    return `https://${this.frontendApi}/v1/poppy/browser_sessions/complete`;
  }

  public issueBrowserCode(endpoint: string) {
    return this.request<{ code: string; browser_join_secret: string; expires_in: number; cookie_suffix: string }>({
      method: 'POST',
      path: browserSessions,
      bodyParams: { endpoint },
    });
  }

  public authorizeBrowserCode(
    endpoint: string,
    code: string,
    version: string,
    poppySessionJwt: string,
    accessToken?: string,
  ) {
    return this.request<void>({
      method: 'POST',
      path: browserSessions + '/authorize',
      bodyParams: { endpoint, code, version, poppySessionJwt, accessToken },
    });
  }

  public redeemBrowserCode(
    endpoint: string,
    code: string,
    browserJoinSecret: string,
    browserToken?: string,
    previousSessionToken?: string,
  ) {
    return this.request<{ browser_token: string; expires_in: number; completion_url?: string; cookie_suffix: string }>({
      method: 'POST',
      path: browserSessions + '/redeem',
      bodyParams: { endpoint, code, browserJoinSecret, browserToken },
      headerParams: previousSessionToken ? { Authorization: `Bearer ${previousSessionToken}` } : undefined,
    });
  }

  public takeBrowserHandshake(endpoint: string, browserToken: string) {
    return this.request<{ handshake: string }>({
      method: 'POST',
      path: browserSessions + '/handshake',
      bodyParams: { endpoint, browserToken },
    });
  }

  public verifyBrowserSession(token: string) {
    return this.request<{ user_id: string; session_id: string; scopes: string[] }>({
      method: 'POST',
      path: browserSessions + '/verify',
      headerParams: { Authorization: `Bearer ${token}` },
    });
  }

  public signOutBrowserSession(endpoint: string, browserToken: string) {
    return this.request<void>({
      method: 'POST',
      path: browserSessions + '/sign_out',
      bodyParams: { endpoint, browserToken },
    });
  }

  public readBrowserSession(endpoint: string, browserToken: string) {
    return this.request<PoppyBrowserSession>({
      method: 'POST',
      path: browserSessions + '/read',
      bodyParams: { endpoint, browserToken },
    });
  }
}
