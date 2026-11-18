import type { TestingToken } from '../resources/TestingToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/testing_tokens';

/** @generateWithEmptyComment */
export class TestingTokenAPI extends AbstractAPI {
  /**
   * Creates a [Testing Token](https://clerk.com/docs/guides/development/testing/overview#testing-tokens) for the instance.
   * @returns The created [`TestingToken`](https://clerk.com/docs/reference/backend/types/backend-testing-token) object.
   */
  public async createTestingToken() {
    return this.request<TestingToken>({
      method: 'POST',
      path: basePath,
    });
  }
}
