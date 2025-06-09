import type { TestingToken } from '../resources/TestingToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/testing_tokens';

/**
 * Description goes here
 */
export class TestingTokenAPI extends AbstractAPI {
  /**
   * Description goes here
   */
  public async createTestingToken() {
    return this.request<TestingToken>({
      method: 'POST',
      path: basePath,
    });
  }
}
