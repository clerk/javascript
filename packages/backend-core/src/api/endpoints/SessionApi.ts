import { joinPaths } from '../../util/path';
import { Session } from '../resources/Session';
import { Token } from '../resources/Token';
import { AbstractAPI } from './AbstractApi';

const basePath = '/sessions';

type QueryParams = {
  clientId?: string;
  userId?: string;
};

export class SessionAPI extends AbstractAPI {
  public getSessionList = async (queryParams?: QueryParams) =>
    this.APIClient.request<Array<Session>>({
      method: 'GET',
      path: basePath,
      queryParams: queryParams,
    });

  public getSession = async (sessionId: string) => {
    this.requireId(sessionId);
    return this.APIClient.request<Session>({
      method: 'GET',
      path: joinPaths(basePath, sessionId),
    });
  };

  public revokeSession = async (sessionId: string) => {
    this.requireId(sessionId);
    return this.APIClient.request<Session>({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'revoke'),
    });
  };

  public verifySession = async (sessionId: string, token: string) => {
    this.requireId(sessionId);
    return this.APIClient.request<Session>({
      method: 'POST',
      path: joinPaths(basePath, sessionId, 'verify'),
      bodyParams: { token },
    });
  };

  public getToken = async (sessionId: string, template: string) => {
    this.requireId(sessionId);
    return (
      (await this.APIClient.request<Token>({
        method: 'POST',
        path: joinPaths(basePath, sessionId, 'tokens', template || ''),
      })) as any
    ).jwt;
  };
}
