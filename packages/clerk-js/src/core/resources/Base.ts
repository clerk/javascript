import type {
  ClerkAPIErrorJSON,
  ClerkPaginatedResponse,
  ClerkResourceJSON,
  ClerkResourceReloadParams,
  DeletedObjectJSON,
} from '@clerk/types';

import { clerkMissingFapiClientInResources } from '../errors';
import type { FapiClient, FapiRequestInit, FapiResponseJSON, HTTPMethod } from '../fapiClient';
import type { Clerk } from './internal';
import { ClerkAPIResponseError, Client } from './internal';

export type BaseFetchOptions = ClerkResourceReloadParams & { forceUpdateClient?: boolean };

export type BaseMutateParams = {
  action?: string;
  body?: any;
  method?: HTTPMethod;
  path?: string;
};

export abstract class BaseResource {
  static clerk: Clerk;
  id?: string;
  pathRoot = '';

  static get fapiClient(): FapiClient {
    return BaseResource.clerk.getFapiClient();
  }

  protected static async _fetch<
    J extends
      | ClerkResourceJSON
      | ClerkResourceJSON[]
      | DeletedObjectJSON
      | DeletedObjectJSON[]
      | ClerkPaginatedResponse<ClerkResourceJSON>,
  >(requestInit: FapiRequestInit, opts: BaseFetchOptions = {}): Promise<FapiResponseJSON<J>> {
    if (!BaseResource.fapiClient) {
      clerkMissingFapiClientInResources();
    }

    const fapiResponse = await BaseResource.fapiClient.request<J>(requestInit);

    const { payload, status, statusText, headers } = fapiResponse;

    if (headers) {
      const country = headers.get('x-country');

      this.clerk.__internal_setCountry(country ? country.toLowerCase() : null);
    }

    // TODO: Link to Client payload piggybacking design document
    if (requestInit.method !== 'GET' || opts.forceUpdateClient) {
      this._updateClient<J>(payload);
    }

    if (status >= 200 && status <= 299) {
      return payload;
    }

    if (status === 401) {
      await BaseResource.clerk.handleUnauthenticated();
    }

    throw new ClerkAPIResponseError(statusText, {
      data: payload?.errors as ClerkAPIErrorJSON[],
      status: status,
    });
  }

  protected static _updateClient<J>(responseJSON: FapiResponseJSON<J> | null): void {
    if (!responseJSON) {
      return;
    }

    // TODO: Revise Client piggybacking
    const client = responseJSON.client || responseJSON.meta?.client;

    if (client && BaseResource.clerk) {
      BaseResource.clerk.updateClient(Client.getInstance().fromJSON(client));
    }
  }

  isNew(): boolean {
    return !this.id;
  }

  protected path(action?: string): string {
    const base = this.pathRoot;

    if (this.isNew()) {
      return base;
    }
    const baseWithId = base.replace(/[^/]$/, '$&/') + encodeURIComponent(this.id as string);

    if (!action) {
      return baseWithId;
    }

    return baseWithId.replace(/[^/]$/, '$&/') + encodeURIComponent(action);
  }

  protected abstract fromJSON(data: ClerkResourceJSON | null): this;

  protected async _baseGet<J extends ClerkResourceJSON>(opts: BaseFetchOptions = {}): Promise<this> {
    const json = await BaseResource._fetch<J>(
      {
        method: 'GET',
        path: this.path(),
        rotatingTokenNonce: opts.rotatingTokenNonce,
      },
      opts,
    );

    return this.fromJSON(json?.response || json);
  }

  protected async _baseMutate<J extends ClerkResourceJSON>({
    action,
    body,
    method = 'POST',
    path,
  }: BaseMutateParams): Promise<this> {
    const json = await BaseResource._fetch<J>({
      method,
      path: path || this.path(action),
      body,
    });
    return this.fromJSON(json?.response || json);
  }

  protected async _basePost<J extends ClerkResourceJSON>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutate<J>({ ...params, method: 'POST' });
  }

  protected async _basePut<J extends ClerkResourceJSON>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutate<J>({ ...params, method: 'PUT' });
  }

  protected async _basePatch<J extends ClerkResourceJSON>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutate<J>({ ...params, method: 'PATCH' });
  }

  protected async _baseDelete<J extends ClerkResourceJSON>(params: BaseMutateParams = {}): Promise<void> {
    await this._baseMutate<J>({ ...params, method: 'DELETE' });
  }

  public async reload(params?: ClerkResourceReloadParams): Promise<this> {
    const { rotatingTokenNonce } = params || {};
    return this._baseGet({ forceUpdateClient: true, rotatingTokenNonce });
  }
}
