/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { emailAddressesCreate } from "../funcs/emailAddressesCreate.js";
import { emailAddressesDelete } from "../funcs/emailAddressesDelete.js";
import { emailAddressesGet } from "../funcs/emailAddressesGet.js";
import { emailAddressesUpdate } from "../funcs/emailAddressesUpdate.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";

export class EmailAddresses extends ClientSDK {
  /**
   * Create an email address
   *
   * @remarks
   * Create a new email address
   */
  async create(
    request?: operations.CreateEmailAddressRequestBody | undefined,
    options?: RequestOptions,
  ): Promise<components.EmailAddress> {
    return unwrapAsync(emailAddressesCreate(
      this,
      request,
      options,
    ));
  }

  /**
   * Retrieve an email address
   *
   * @remarks
   * Returns the details of an email address.
   */
  async get(
    request: operations.GetEmailAddressRequest,
    options?: RequestOptions,
  ): Promise<components.EmailAddress> {
    return unwrapAsync(emailAddressesGet(
      this,
      request,
      options,
    ));
  }

  /**
   * Delete an email address
   *
   * @remarks
   * Delete the email address with the given ID
   */
  async delete(
    request: operations.DeleteEmailAddressRequest,
    options?: RequestOptions,
  ): Promise<components.DeletedObject> {
    return unwrapAsync(emailAddressesDelete(
      this,
      request,
      options,
    ));
  }

  /**
   * Update an email address
   *
   * @remarks
   * Updates an email address.
   */
  async update(
    request: operations.UpdateEmailAddressRequest,
    options?: RequestOptions,
  ): Promise<components.EmailAddress> {
    return unwrapAsync(emailAddressesUpdate(
      this,
      request,
      options,
    ));
  }
}
