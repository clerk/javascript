import type { HostedAuthToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/hosted_auth/token';

type ExchangeCodeParams = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

type RefreshSessionParams = {
  sessionId: string;
  refreshToken: string;
  origin: string;
};

export class HostedAuthAPI extends AbstractAPI {
  public async exchangeCode(params: ExchangeCodeParams) {
    return this.request<HostedAuthToken>({
      method: 'POST',
      path: basePath,
      bodyParams: { grantType: 'authorization_code', ...params },
    });
  }

  public async refreshSession(params: RefreshSessionParams) {
    return this.request<HostedAuthToken>({
      method: 'POST',
      path: basePath,
      bodyParams: { grantType: 'refresh_token', ...params },
    });
  }
}
