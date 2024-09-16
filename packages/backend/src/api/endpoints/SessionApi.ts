import type { ClerkPaginationRequest, SessionStatus } from '@clerk/types';

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

  public async getToken(sessionId: string, template: string) {
    this.requireId(sessionId);
    return this.request<Token>({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'tokens', template || ''),
    });
  }

  public async refreshSession(sessionId: string, params: RefreshTokenParams) {
    this.requireId(sessionId);
    return this.request<Cookies>({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'refresh'),
      bodyParams: params,
    });
  }
}
