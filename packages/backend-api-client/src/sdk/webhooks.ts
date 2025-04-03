/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { webhooksCreateSvixApp } from "../funcs/webhooksCreateSvixApp.js";
import { webhooksDeleteSvixApp } from "../funcs/webhooksDeleteSvixApp.js";
import { webhooksGenerateSvixAuthURL } from "../funcs/webhooksGenerateSvixAuthURL.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import { unwrapAsync } from "../types/fp.js";

export class Webhooks extends ClientSDK {
  /**
   * Create a Svix app
   *
   * @remarks
   * Create a Svix app and associate it with the current instance
   */
  async createSvixApp(
    options?: RequestOptions,
  ): Promise<components.SvixURL> {
    return unwrapAsync(webhooksCreateSvixApp(
      this,
      options,
    ));
  }

  /**
   * Delete a Svix app
   *
   * @remarks
   * Delete a Svix app and disassociate it from the current instance
   */
  async deleteSvixApp(
    options?: RequestOptions,
  ): Promise<void> {
    return unwrapAsync(webhooksDeleteSvixApp(
      this,
      options,
    ));
  }

  /**
   * Create a Svix Dashboard URL
   *
   * @remarks
   * Generate a new url for accessing the Svix's management dashboard for that particular instance
   */
  async generateSvixAuthURL(
    options?: RequestOptions,
  ): Promise<components.SvixURL> {
    return unwrapAsync(webhooksGenerateSvixAuthURL(
      this,
      options,
    ));
  }
}
