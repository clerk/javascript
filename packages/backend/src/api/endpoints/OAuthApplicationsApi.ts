import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { OAuthApplication } from '../resources/OAuthApplication';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/oauth_applications';

/** @generateWithEmptyComment */
export type CreateOAuthApplicationParams = {
  /**
   * A descriptive name for the OAuth application (e.g., "My Web App", "My Mobile App"). Maximum length: 256 characters.
   */
  name: string;
  /** An array of redirect URIs for the OAuth application. */
  redirectUris?: Array<string> | null | undefined;
  /** Scopes for the OAuth application that dictate the user payload of the OAuth user info endpoint. Available scopes are `profile`, `email`, `public_metadata`, `private_metadata`. Provide the requested scopes as a string, separated by spaces. */
  scopes?: string | null | undefined;
  /** Whether the OAuth application is public. If `true`, the Proof Key of Code Exchange (PKCE) flow can be used. */
  public?: boolean | null | undefined;
};

/** @generateWithEmptyComment */
export type UpdateOAuthApplicationParams = CreateOAuthApplicationParams & {
  /** The ID of the OAuth application to update. */
  oauthApplicationId: string;
};

/** @generateWithEmptyComment */
export type GetOAuthApplicationListParams = ClerkPaginationRequest<{
  /**
   * Returns OAuth applications in a particular order. Prefix a value with `+` to sort in ascending order, or `-` to sort in descending order. Defaults to `-created_at`.
   */
  orderBy?: WithSign<'name' | 'created_at'>;
}>;

/** @generateWithEmptyComment */
export class OAuthApplicationsApi extends AbstractAPI {
  /**
   * Gets a list of OAuth applications for the instance.
   * @param params - The parameters to get the OAuth applications with.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) objects and a `totalCount` property containing the total number of OAuth applications.
   */
  public async list(params: GetOAuthApplicationListParams = {}) {
    return this.request<PaginatedResourceResponse<OAuthApplication[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  /**
   * Gets the given OAuth application.
   * @param oauthApplicationId - The ID of the OAuth application to get.
   * @returns The [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async get(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'GET',
      path: joinPaths(basePath, oauthApplicationId),
    });
  }

  /**
   * Creates a new OAuth application.
   * @param params - The parameters to create the OAuth application with.
   * @returns The created [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async create(params: CreateOAuthApplicationParams) {
    return this.request<OAuthApplication>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Updates the given OAuth application.
   * @returns The updated [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async update(params: UpdateOAuthApplicationParams) {
    const { oauthApplicationId, ...bodyParams } = params;

    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'PATCH',
      path: joinPaths(basePath, oauthApplicationId),
      bodyParams,
    });
  }

  /**
   * Deletes the given OAuth application.
   * @param oauthApplicationId - The ID of the OAuth application to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  public async delete(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, oauthApplicationId),
    });
  }

  /**
   * Rotates the secret of the given OAuth application. When the client secret is rotated, ensure that you update it in your authorized OAuth clients.
   * @param oauthApplicationId - The ID of the OAuth application to rotate the secret of.
   * @returns The [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async rotateSecret(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'POST',
      path: joinPaths(basePath, oauthApplicationId, 'rotate_secret'),
    });
  }
}
