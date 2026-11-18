import { joinPaths } from '../../util/path';
import type { AccountlessApplication } from '../resources/AccountlessApplication';
import { AbstractAPI } from './AbstractApi';

const basePath = '/accountless_applications';

type AccountlessApplicationParams = {
  requestHeaders?: Headers;
  source?: string;
};

export class AccountlessApplicationAPI extends AbstractAPI {
  public async createAccountlessApplication(params?: AccountlessApplicationParams): Promise<AccountlessApplication> {
    const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : undefined;
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: basePath,
      headerParams,
      queryParams: {
        source: params?.source,
      },
    });
  }

  public async completeAccountlessApplicationOnboarding(
    params?: AccountlessApplicationParams,
  ): Promise<AccountlessApplication> {
    const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : undefined;
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: joinPaths(basePath, 'complete'),
      headerParams,
      queryParams: {
        source: params?.source,
      },
    });
  }
}
