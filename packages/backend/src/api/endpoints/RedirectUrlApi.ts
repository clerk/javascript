import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { RedirectUrl } from '../resources/RedirectUrl';
import { AbstractAPI } from './AbstractApi';

const basePath = '/redirect_urls';

/** @generateWithEmptyComment */
export type CreateRedirectUrlParams = {
  /** The full URL value prefixed with `https://` or a custom scheme. For example, `https://my-app.com/oauth-callback` or `my-app://oauth-callback`. */
  url: string;
};

/** @generateWithEmptyComment */
export class RedirectUrlAPI extends AbstractAPI {
  /**
   * Gets a list of whitelisted redirect URLs for the instance.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url) objects and a `totalCount` property containing the total number of redirect URLs.
   */
  public async getRedirectUrlList() {
    return this.request<PaginatedResourceResponse<RedirectUrl[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { paginated: true },
    });
  }

  /**
   * Gets the given [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url).
   * @param redirectUrlId - The ID of the redirect URL to get.
   */
  public async getRedirectUrl(redirectUrlId: string) {
    this.requireId(redirectUrlId);
    return this.request<RedirectUrl>({
      method: 'GET',
      path: joinPaths(basePath, redirectUrlId),
    });
  }

  /**
   * Creates a new redirect URL for the instance.
   * @returns The created [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url) object.
   */
  public async createRedirectUrl(params: CreateRedirectUrlParams) {
    return this.request<RedirectUrl>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Deletes the given redirect URL.
   * @param redirectUrlId - The ID of the redirect URL to delete.
   * @returns The deleted [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url) object.
   */
  public async deleteRedirectUrl(redirectUrlId: string) {
    this.requireId(redirectUrlId);
    return this.request<RedirectUrl>({
      method: 'DELETE',
      path: joinPaths(basePath, redirectUrlId),
    });
  }
}
