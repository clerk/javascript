/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { blocklistIdentifiersCreate } from '../funcs/blocklistIdentifiersCreate.js';
import { blocklistIdentifiersDelete } from '../funcs/blocklistIdentifiersDelete.js';
import { blocklistIdentifiersList } from '../funcs/blocklistIdentifiersList.js';
import { ClientSDK, RequestOptions } from '../lib/sdks.js';
import * as components from '../models/components/index.js';
import * as operations from '../models/operations/index.js';
import { unwrapAsync } from '../types/fp.js';

export class BlocklistIdentifiers extends ClientSDK {
  /**
   * List all identifiers on the block-list
   *
   * @remarks
   * Get a list of all identifiers which are not allowed to access an instance
   */
  async list(options?: RequestOptions): Promise<components.BlocklistIdentifiers> {
    return unwrapAsync(blocklistIdentifiersList(this, options));
  }

  /**
   * Add identifier to the block-list
   *
   * @remarks
   * Create an identifier that is blocked from accessing an instance
   */
  async create(
    request?: operations.CreateBlocklistIdentifierRequestBody | undefined,
    options?: RequestOptions,
  ): Promise<components.BlocklistIdentifier> {
    return unwrapAsync(blocklistIdentifiersCreate(this, request, options));
  }

  /**
   * Delete identifier from block-list
   *
   * @remarks
   * Delete an identifier from the instance block-list
   */
  async delete(
    request: operations.DeleteBlocklistIdentifierRequest,
    options?: RequestOptions,
  ): Promise<components.DeletedObject> {
    return unwrapAsync(blocklistIdentifiersDelete(this, request, options));
  }
}
