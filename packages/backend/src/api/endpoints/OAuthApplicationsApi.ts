import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { OAuthApplication } from '../resources/OAuthApplication';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/oauth_applications';

type CreateOAuthApplicationParams = {
  /**
   * The name of the new OAuth application.
   *
   * @remarks Max length: 256
   */
  name: string;
  /**
   * An array of redirect URIs of the new OAuth application
   */
  redirectUris?: Array<string> | null | undefined;
  /**
   * Define the allowed scopes for the new OAuth applications that dictate the user payload of the OAuth user info endpoint. Available scopes are `profile`, `email`, `public_metadata`, `private_metadata`. Provide the requested scopes as a string, separated by spaces.
   */
  scopes?: string | null | undefined;
  /**
   * If true, this client is public and you can use the Proof Key of Code Exchange (PKCE) flow.
   */
  public?: boolean | null | undefined;
};

type UpdateOAuthApplicationParams = CreateOAuthApplicationParams & {
  /**
   * The ID of the OAuth application to update
   */
  oauthApplicationId: string;
};

type GetOAuthApplicationListParams = ClerkPaginationRequest<{
  /**
   * Sorts OAuth applications by name or created_at.
   * By prepending one of those values with + or -, we can choose to sort in ascending (ASC) or descending (DESC) order.
   */
  orderBy?: WithSign<'name' | 'created_at'>;
}>;

export class OAuthApplicationsApi extends AbstractAPI {
  public async list(params: GetOAuthApplicationListParams = {}) {
    return this.request<PaginatedResourceResponse<OAuthApplication[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async get(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'GET',
      path: joinPaths(basePath, oauthApplicationId),
    });
  }

  public async create(params: CreateOAuthApplicationParams) {
    return this.request<OAuthApplication>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async update(params: UpdateOAuthApplicationParams) {
    const { oauthApplicationId, ...bodyParams } = params;

    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'PATCH',
      path: joinPaths(basePath, oauthApplicationId),
      bodyParams,
    });
  }

  public async delete(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, oauthApplicationId),
    });
  }

  public async rotateSecret(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'POST',
      path: joinPaths(basePath, oauthApplicationId, 'rotate_secret'),
    });
  }
}
