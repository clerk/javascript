import type { TestSessionToken } from '../resources/TestSessionToken';
import { AbstractAPI } from './AbstractApi';

type CreateTestSessionTokenParams = {
  userId: string;
  sessionMaxDurationInSeconds?: number;
};

const basePath = '/test_session_tokens';

export class TestSessionTokenAPI extends AbstractAPI {
  public async create(params: CreateTestSessionTokenParams) {
    return this.request<TestSessionToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
