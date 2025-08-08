import { joinPaths } from '../../util/path';
import type { AccountlessApplication } from '../resources/AccountlessApplication';
import { AbstractAPI } from './AbstractApi';

const basePath = '/accountless_applications';

export class AccountlessApplicationAPI extends AbstractAPI {
  public async createAccountlessApplication(params?: { requestHeaders?: Headers }) {
    const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : undefined;
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: basePath,
      headerParams,
    });
  }

  public async completeAccountlessApplicationOnboarding(params?: { requestHeaders?: Headers }) {
    const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : undefined;
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: joinPaths(basePath, 'complete'),
      headerParams,
    });
  }
}
