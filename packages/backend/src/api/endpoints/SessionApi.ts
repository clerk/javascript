import type { SessionStatus } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Session } from '../resources/Session';
import type { Token } from '../resources/Token';
import { AbstractAPI } from './AbstractApi';

const basePath = '/sessions';

type QueryParams = {
  clientId?: string;
  userId?: string;
  status?: SessionStatus;
};

export class SessionAPI extends AbstractAPI {
  public async getSessionList(queryParams?: QueryParams) {
    return this.request<PaginatedResourceResponse<Session[]>>({
      method: 'GET',
      path: basePath,
      queryParams: queryParams,
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
}
