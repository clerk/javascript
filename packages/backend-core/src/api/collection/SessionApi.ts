import { Session } from '../resources/Session';
import { AbstractApi } from './AbstractApi';

type QueryParams = {
  clientId?: string;
  userId?: string;
};

export class SessionApi extends AbstractApi {
  public async getSessionList(queryParams?: QueryParams) {
    return this._restClient.makeRequest<Array<Session>>({
      method: 'GET',
      path: '/sessions',
      queryParams: queryParams,
    });
  }

  public async getSession(sessionId: string) {
    this.requireId(sessionId);
    return this._restClient.makeRequest<Session>({
      method: 'GET',
      path: `/sessions/${sessionId}`,
    });
  }

  public async revokeSession(sessionId: string) {
    this.requireId(sessionId);
    return this._restClient.makeRequest<Session>({
      method: 'POST',
      path: `/sessions/${sessionId}/revoke`,
    });
  }

  public async verifySession(sessionId: string, token: string) {
    this.requireId(sessionId);
    return this._restClient.makeRequest<Session>({
      method: 'POST',
      path: `/sessions/${sessionId}/verify`,
      bodyParams: { token },
    });
  }
}
