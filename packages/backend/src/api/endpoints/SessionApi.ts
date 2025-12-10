import type { ClerkPaginationRequest, SessionStatus } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { Cookies } from '../resources/Cookies';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Session } from '../resources/Session';
import type { Token } from '../resources/Token';
import { AbstractAPI } from './AbstractApi';

const basePath = '/sessions';

type SessionListParams = ClerkPaginationRequest<{
  clientId?: string;
  userId?: string;
  status?: SessionStatus;
}>;

type RefreshTokenParams = {
  expired_token: string;
  refresh_token: string;
  request_origin: string;
  request_originating_ip?: string;
  request_headers?: Record<string, string[]>;
  suffixed_cookies?: boolean;
  format?: 'token' | 'cookie';
};

type CreateSessionParams = {
  userId: string;
};

export class SessionAPI extends AbstractAPI {
  public async getSessionList(params: SessionListParams = {}) {
    return this.request<PaginatedResourceResponse<Session[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  public async getSession(sessionId: string) {
    this.requireId(sessionId);
    return this.request<Session>({
      method: 'GET',
      path: joinPaths(basePath, sessionId),
    });
  }

  public async createSession(params: CreateSessionParams) {
    return this.request<Session>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async revokeSession(sessionId: string) {
    this.requireId(sessionId);
    return this.request<Session>({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'revoke'),
    });
  }

  public async verifySession(sessionId: string, token: string) {
    this.requireId(sessionId);
    return this.request<Session>({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'verify'),
      bodyParams: { token },
    });
  }

  /**
   * Retrieves a session token or generates a JWT using a specified template.
   *
   * @param sessionId - The ID of the session for which to generate the token
   * @param template - Optional name of the JWT template configured in the Clerk Dashboard.
   * @param expiresInSeconds - Optional expiration time for the token in seconds.
   *   If not provided, uses the default expiration.
   *
   * @returns A promise that resolves to the generated token
   *
   * @throws {Error} When sessionId is invalid or empty
   */
  public async getToken(sessionId: string, template?: string, expiresInSeconds?: number) {
    this.requireId(sessionId);

    const path = template
      ? joinPaths(basePath, sessionId, 'tokens', template)
      : joinPaths(basePath, sessionId, 'tokens');

    const requestOptions: any = {
      method: 'POST',
      path,
    };

    if (expiresInSeconds !== undefined) {
      requestOptions.bodyParams = { expires_in_seconds: expiresInSeconds };
    }

    return this.request<Token>(requestOptions);
  }

  public async refreshSession(sessionId: string, params: RefreshTokenParams & { format: 'token' }): Promise<Token>;
  public async refreshSession(sessionId: string, params: RefreshTokenParams & { format: 'cookie' }): Promise<Cookies>;
  public async refreshSession(sessionId: string, params: RefreshTokenParams): Promise<Token>;
  public async refreshSession(sessionId: string, params: RefreshTokenParams): Promise<Token | Cookies> {
    this.requireId(sessionId);
    const { suffixed_cookies, ...restParams } = params;
    return this.request({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'refresh'),
      bodyParams: restParams,
      queryParams: { suffixed_cookies },
    });
  }
}
