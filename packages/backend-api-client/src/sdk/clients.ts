/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { clientsGet } from "../funcs/clientsGet.js";
import { clientsList } from "../funcs/clientsList.js";
import { clientsVerify } from "../funcs/clientsVerify.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";

export class Clients extends ClientSDK {
  /**
   * List all clients
   *
   * @remarks
   * Returns a list of all clients. The clients are returned sorted by creation date,
   * with the newest clients appearing first.
   * Warning: the endpoint is being deprecated and will be removed in future versions.
   *
   * @deprecated method: This will be removed in a future release, please migrate away from it as soon as possible.
   */
  async list(
    request: operations.GetClientListRequest,
    options?: RequestOptions,
  ): Promise<Array<components.Client>> {
    return unwrapAsync(clientsList(
      this,
      request,
      options,
    ));
  }

  /**
   * Verify a client
   *
   * @remarks
   * Verifies the client in the provided token
   */
  async verify(
    request?: operations.VerifyClientRequestBody | undefined,
    options?: RequestOptions,
  ): Promise<components.Client> {
    return unwrapAsync(clientsVerify(
      this,
      request,
      options,
    ));
  }

  /**
   * Get a client
   *
   * @remarks
   * Returns the details of a client.
   */
  async get(
    request: operations.GetClientRequest,
    options?: RequestOptions,
  ): Promise<components.Client> {
    return unwrapAsync(clientsGet(
      this,
      request,
      options,
    ));
  }
}
