import { Session } from '../resources/Session';
import { Token } from '../resources/Token';
import { AbstractApi } from './AbstractApi';

type QueryParams = {
  clientId?: string;
  userId?: string;
};

export class SessionApi extends AbstractApi {
  public getSessionList = async (queryParams?: QueryParams) =>
    this._restClient.makeRequest<Array<Session>>({
      method: 'GET',
      path: '/sessions',
      queryParams: queryParams,
    });

  public getSession = async (sessionId: string) => {
    this.requireId(sessionId);
    return this._restClient.makeRequest<Session>({
      method: 'GET',
      path: `/sessions/${sessionId}`,
    });
  };

  public revokeSession = async (sessionId: string) => {
    this.requireId(sessionId);
    return this._restClient.makeRequest<Session>({
      method: 'POST',
      path: `/sessions/${sessionId}/revoke`,
    });
  };

  public verifySession = async (sessionId: string, token: string) => {
    this.requireId(sessionId);
    return this._restClient.makeRequest<Session>({
      method: 'POST',
      path: `/sessions/${sessionId}/verify`,
      bodyParams: { token },
    });
  };

  public getToken = async (sessionId: string, template: string) => {
    this.requireId(sessionId);
    return (
      (await this._restClient.makeRequest<Token>({
        method: 'POST',
        path: `/sessions/${sessionId}/tokens/${template || ''}`,
      })) as any
    ).jwt;
  };
}
