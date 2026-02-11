import { isValidBrowserOnline } from '@clerk/shared/browser';
import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import { isProductionFromPublishableKey } from '@clerk/shared/keys';
import type {
  ClerkAPIErrorJSON,
  ClerkResourceJSON,
  ClerkResourceReloadParams,
  ClientResource,
  DeletedObjectJSON,
} from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';

import { clerkMissingFapiClientInResources } from '../errors';
import type { FapiClient, FapiRequestInit, FapiResponse, FapiResponseJSON, HTTPMethod } from '../fapiClient';
import { FraudProtection } from '../fraudProtection';
import type { Clerk } from './internal';
import { Client } from './internal';

export type BaseFetchOptions = ClerkResourceReloadParams & {
  forceUpdateClient?: boolean;
  skipUpdateClient?: boolean;
  fetchMaxTries?: number;
};

export type BaseMutateParams = {
  action?: string;
  body?: any;
  method?: HTTPMethod;
  path?: string;
};

function assertProductionKeysOnDev(statusCode: number, payloadErrors?: ClerkAPIErrorJSON[]) {
  if (!payloadErrors) {
    return;
  }

  if (!payloadErrors[0]) {
    return;
  }

  const safeError = payloadErrors[0];
  const safeErrorMessage = safeError.long_message;

  if (safeError.code === 'origin_invalid' && isProductionFromPublishableKey(BaseResource.clerk.publishableKey)) {
    const prodDomain = BaseResource.clerk.frontendApi.replace('clerk.', '');
    throw new ClerkAPIResponseError(
      `Clerk: Production Keys are only allowed for domain "${prodDomain}". \nAPI Error: ${safeErrorMessage}`,
      {
        data: payloadErrors,
        status: statusCode,
      },
    );
  }
}

export abstract class BaseResource {
  static clerk: Clerk;
  id?: string;
  pathRoot = '';

  static get fapiClient(): FapiClient {
    return BaseResource.clerk.getFapiClient();
  }

  public async reload(params?: ClerkResourceReloadParams): Promise<this> {
    const { rotatingTokenNonce } = params || {};
    return this._baseGet({ forceUpdateClient: true, rotatingTokenNonce });
  }

  public isNew(): boolean {
    return !this.id;
  }

  // TODO @userland-errors:
  static async _fetch<J extends ClerkResourceJSON | DeletedObjectJSON | null>(
    requestInit: FapiRequestInit,
    opts: BaseFetchOptions = {},
  ): Promise<FapiResponseJSON<J> | null> {
    return FraudProtection.getInstance().execute(this.clerk, () => this._baseFetch<J>(requestInit, opts));
  }

  // TODO @userland-errors:
  protected static async _baseFetch<J extends ClerkResourceJSON | DeletedObjectJSON | null>(
    requestInit: FapiRequestInit,
    opts: BaseFetchOptions = {},
  ): Promise<FapiResponseJSON<J> | null> {
    if (!BaseResource.fapiClient) {
      clerkMissingFapiClientInResources();
    }

    let fapiResponse: FapiResponse<J>;
    const { fetchMaxTries } = opts;

    try {
      fapiResponse = await BaseResource.fapiClient.request<J>(requestInit, { fetchMaxTries });
    } catch (e) {
      // TODO: This should be the default behavior in the next major version, as long as we have a way to handle the requests more gracefully when offline
      if (this.shouldRethrowOfflineNetworkErrors()) {
        // TODO @userland-errors:
        throw new ClerkRuntimeError(e?.message || e, {
          code: 'network_error',
        });
      } else if (!isValidBrowserOnline()) {
        debugLogger.warn(
          'Network request failed while offline, returning null',
          {
            method: requestInit.method,
            path: requestInit.path,
          },
          'baseResource',
        );
        return null;
      } else {
        throw e;
      }
    }

    const { payload, status, statusText, headers } = fapiResponse;

    if (headers) {
      const country = headers.get('x-country');

      this.clerk.__internal_setCountry(country ? country.toLowerCase() : null);
    }

    // TODO: Link to Client payload piggybacking design document
    if ((requestInit.method !== 'GET' || opts.forceUpdateClient) && !opts.skipUpdateClient) {
      this._updateClient<J>(payload);
    }

    if (status >= 200 && status <= 299) {
      return payload;
    }

    if (status >= 400) {
      const errors = payload?.errors as ClerkAPIErrorJSON[];
      const message = errors?.[0]?.long_message;
      const code = errors?.[0]?.code;

      // if the status is 401, we need to handle unauthenticated as we did before
      // otherwise, we are going to ignore the requires_captcha error
      // as we're going to handle it by triggering the captcha challenge
      if (status === 401 && code !== 'requires_captcha') {
        await BaseResource.clerk.handleUnauthenticated();
      }

      assertProductionKeysOnDev(status, errors);

      const apiResponseOptions: ConstructorParameters<typeof ClerkAPIResponseError>[1] = { data: errors, status };
      if (status === 429 && headers) {
        const retryAfter = headers.get('retry-after');
        if (retryAfter) {
          const value = parseInt(retryAfter, 10);
          if (!isNaN(value)) {
            apiResponseOptions.retryAfter = value;
          }
        }
      }

      throw new ClerkAPIResponseError(message || statusText, apiResponseOptions);
    }

    return null;
  }

  protected static _getClientResourceFromPayload<J>(
    responseJSON: FapiResponseJSON<J> | null,
  ): ClientResource | undefined {
    if (!responseJSON) {
      return undefined;
    }
    const clientJSON = responseJSON.client || responseJSON.meta?.client;
    return clientJSON ? Client.getOrCreateInstance().fromJSON(clientJSON) : undefined;
  }

  protected static _updateClient<J>(responseJSON: FapiResponseJSON<J> | null): void {
    const client = this._getClientResourceFromPayload(responseJSON);
    if (client && BaseResource.clerk) {
      BaseResource.clerk.updateClient(client);
    }
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

  /**
   * Returns the provided value if it is not `undefined` or `null`, otherwise returns the default value.
   *
   * @template T - The type of the value.
   * @param value - The value to check.
   * @param defaultValue - The default value to return if the provided value is `undefined` or `null`.
   * @returns The provided value if it is not `undefined` or `null`, otherwise the default value.
   */
  protected withDefault<T>(value: T | undefined | null, defaultValue: T): T {
    return value ?? defaultValue;
  }

  protected async _baseGet<J extends ClerkResourceJSON | null>(opts: BaseFetchOptions = {}): Promise<this> {
    const json = await BaseResource._fetch<J>(
      {
        method: 'GET',
        path: this.path(),
        rotatingTokenNonce: opts.rotatingTokenNonce,
      },
      opts,
    );

    return this.fromJSON((json?.response || json) as J);
  }

  protected async _baseMutate<J extends ClerkResourceJSON | null>(params: BaseMutateParams): Promise<this> {
    const { action, body, method, path } = params;
    // TODO @userland-errors:
    const json = await BaseResource._fetch<J>({ method, path: path || this.path(action), body });
    return this.fromJSON((json?.response || json) as J);
  }

  protected async _baseMutateBypass<J extends ClerkResourceJSON | null>(params: BaseMutateParams): Promise<this> {
    const { action, body, method, path } = params;
    const json = await BaseResource._baseFetch<J>({ method, path: path || this.path(action), body });
    return this.fromJSON((json?.response || json) as J);
  }

  protected async _basePost<J extends ClerkResourceJSON | null>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutate<J>({ ...params, method: 'POST' });
  }

  protected async _basePostBypass<J extends ClerkResourceJSON>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutateBypass<J>({ ...params, method: 'POST' });
  }

  protected async _basePut<J extends ClerkResourceJSON | null>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutate<J>({ ...params, method: 'PUT' });
  }

  protected async _basePatch<J extends ClerkResourceJSON>(params: BaseMutateParams = {}): Promise<this> {
    return this._baseMutate<J>({ ...params, method: 'PATCH' });
  }

  protected async _baseDelete<J extends ClerkResourceJSON | null>(params: BaseMutateParams = {}): Promise<void> {
    await this._baseMutate<J>({ ...params, method: 'DELETE' });
  }

  private static shouldRethrowOfflineNetworkErrors(): boolean {
    const experimental = BaseResource.clerk?.__internal_getOption?.('experimental');
    return experimental?.rethrowOfflineNetworkErrors || false;
  }
}
