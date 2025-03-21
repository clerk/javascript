/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { redirectUrlsCreate } from '../funcs/redirectUrlsCreate.js';
import { redirectUrlsDelete } from '../funcs/redirectUrlsDelete.js';
import { redirectUrlsGet } from '../funcs/redirectUrlsGet.js';
import { redirectUrlsList } from '../funcs/redirectUrlsList.js';
import { ClientSDK, RequestOptions } from '../lib/sdks.js';
import * as components from '../models/components/index.js';
import * as operations from '../models/operations/index.js';
import { unwrapAsync } from '../types/fp.js';

export class RedirectUrls extends ClientSDK {
  /**
   * List all redirect URLs
   *
   * @remarks
   * Lists all whitelisted redirect_urls for the instance
   */
  async list(
    request: operations.ListRedirectURLsRequest,
    options?: RequestOptions,
  ): Promise<Array<components.RedirectURL>> {
    return unwrapAsync(redirectUrlsList(this, request, options));
  }

  /**
   * Create a redirect URL
   *
   * @remarks
   * Create a redirect URL
   */
  async create(
    request?: operations.CreateRedirectURLRequestBody | undefined,
    options?: RequestOptions,
  ): Promise<components.RedirectURL> {
    return unwrapAsync(redirectUrlsCreate(this, request, options));
  }

  /**
   * Retrieve a redirect URL
   *
   * @remarks
   * Retrieve the details of the redirect URL with the given ID
   */
  async get(request: operations.GetRedirectURLRequest, options?: RequestOptions): Promise<components.RedirectURL> {
    return unwrapAsync(redirectUrlsGet(this, request, options));
  }

  /**
   * Delete a redirect URL
   *
   * @remarks
   * Remove the selected redirect URL from the whitelist of the instance
   */
  async delete(
    request: operations.DeleteRedirectURLRequest,
    options?: RequestOptions,
  ): Promise<components.DeletedObject> {
    return unwrapAsync(redirectUrlsDelete(this, request, options));
  }
}
