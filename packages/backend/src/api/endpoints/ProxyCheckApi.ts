import type { ProxyCheck } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/proxy_checks';

type VerifyParams = {
  domainId: string;
  proxyUrl: string;
};

export class ProxyCheckAPI extends AbstractAPI {
  public async verify(params: VerifyParams) {
    return this.request<ProxyCheck>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
