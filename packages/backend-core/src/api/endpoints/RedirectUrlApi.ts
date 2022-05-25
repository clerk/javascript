import { joinPaths } from '../../util/path';
import { RedirectUrl } from '../resources/RedirectUrl';
import { AbstractAPI } from './AbstractApi';

const basePath = '/redirect_urls';

type CreateRedirectUrlParams = {
  url: string;
};

export class RedirectUrlAPI extends AbstractAPI {
  public async getRedirectUrlList() {
    return this.APIClient.request<Array<RedirectUrl>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async getRedirectUrl(redirectUrlId: string) {
    this.requireId(redirectUrlId);
    return this.APIClient.request<RedirectUrl>({
      method: 'GET',
      path: joinPaths(basePath, redirectUrlId),
    });
  }

  public async createRedirectUrl(params: CreateRedirectUrlParams): Promise<RedirectUrl> {
    return this.APIClient.request<RedirectUrl>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async deleteRedirectUrl(redirectUrlId: string) {
    this.requireId(redirectUrlId);
    return this.APIClient.request<RedirectUrl>({
      method: 'DELETE',
      path: joinPaths(basePath, redirectUrlId),
    });
  }
}
