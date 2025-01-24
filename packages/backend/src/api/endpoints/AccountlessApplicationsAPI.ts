import { joinPaths } from '../../util/path';
import type { AccountlessApplication } from '../resources/AccountlessApplication';
import { AbstractAPI } from './AbstractApi';

const basePath = '/accountless_applications';

export class AccountlessApplicationAPI extends AbstractAPI {
  public async createAccountlessApplication() {
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: basePath,
    });
  }

  public async completeAccountlessApplicationOnboarding() {
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: joinPaths(basePath, 'complete'),
    });
  }
}
