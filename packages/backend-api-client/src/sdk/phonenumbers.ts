/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { phoneNumbersCreate } from "../funcs/phoneNumbersCreate.js";
import { phoneNumbersDelete } from "../funcs/phoneNumbersDelete.js";
import { phoneNumbersGet } from "../funcs/phoneNumbersGet.js";
import { phoneNumbersUpdate } from "../funcs/phoneNumbersUpdate.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";

export class PhoneNumbers extends ClientSDK {
  /**
   * Create a phone number
   *
   * @remarks
   * Create a new phone number
   */
  async create(
    request?: operations.CreatePhoneNumberRequestBody | undefined,
    options?: RequestOptions,
  ): Promise<components.PhoneNumber> {
    return unwrapAsync(phoneNumbersCreate(
      this,
      request,
      options,
    ));
  }

  /**
   * Retrieve a phone number
   *
   * @remarks
   * Returns the details of a phone number
   */
  async get(
    request: operations.GetPhoneNumberRequest,
    options?: RequestOptions,
  ): Promise<components.PhoneNumber> {
    return unwrapAsync(phoneNumbersGet(
      this,
      request,
      options,
    ));
  }

  /**
   * Delete a phone number
   *
   * @remarks
   * Delete the phone number with the given ID
   */
  async delete(
    request: operations.DeletePhoneNumberRequest,
    options?: RequestOptions,
  ): Promise<components.DeletedObject> {
    return unwrapAsync(phoneNumbersDelete(
      this,
      request,
      options,
    ));
  }

  /**
   * Update a phone number
   *
   * @remarks
   * Updates a phone number
   */
  async update(
    request: operations.UpdatePhoneNumberRequest,
    options?: RequestOptions,
  ): Promise<components.PhoneNumber> {
    return unwrapAsync(phoneNumbersUpdate(
      this,
      request,
      options,
    ));
  }
}
