import type { TestingToken } from '../resources/TestingToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/testing_tokens';

export class TestingTokenAPI extends AbstractAPI {
  public async createTestingToken() {
    return this.request<TestingToken>({
      method: 'POST',
      path: basePath,
    });
  }
}
