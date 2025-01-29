import { isValidBrowserOnline } from '@clerk/shared/browser';
import type { ClerkAPIErrorJSON, ClerkResourceJSON, DeletedObjectJSON } from '@clerk/types';

import type { FapiClient, FapiRequestInit, FapiResponse, FapiResponseJSON } from '../fapiClient';
import { FraudProtection } from '../fraudProtection';
import type { Clerk } from './internal';
import { ClerkAPIResponseError, ClerkRuntimeError, Client } from './internal';

export interface ApiServiceOptions {
  fetchMaxTries?: number;
  forceUpdateClient?: boolean;
  rotatingTokenNonce?: string;
}

export interface ApiService {
  delete<J extends ClerkResourceJSON | null>(path: string, opts?: ApiServiceOptions): Promise<J | null>;
  get<J extends ClerkResourceJSON | null>(path: string, opts?: ApiServiceOptions): Promise<J | null>;
  patch<J extends ClerkResourceJSON | null>(path: string, body?: any, opts?: ApiServiceOptions): Promise<J | null>;
  post<J extends ClerkResourceJSON | null>(path: string, body?: any, opts?: ApiServiceOptions): Promise<J | null>;
  put<J extends ClerkResourceJSON | null>(path: string, body?: any, opts?: ApiServiceOptions): Promise<J | null>;

  request<J extends ClerkResourceJSON | DeletedObjectJSON | null>(
    init: FapiRequestInit,
    opts?: ApiServiceOptions,
  ): Promise<J | null>;
}

export class ClerkApiService implements ApiService {
  private clerk: Clerk;
  private fapiClient: FapiClient;

  constructor(clerk: Clerk) {
    this.clerk = clerk;
    this.fapiClient = clerk.getFapiClient();
  }

  public async get<J extends ClerkResourceJSON | null>(path: string, opts?: ApiServiceOptions): Promise<J | null> {
    return this.request<J>({ method: 'GET', path }, opts);
  }

  public async post<J extends ClerkResourceJSON | null>(
    path: string,
    body?: any,
    opts?: ApiServiceOptions,
  ): Promise<J | null> {
    return this.request<J>({ method: 'POST', path, body }, opts);
  }

  public async put<J extends ClerkResourceJSON | null>(
    path: string,
    body?: any,
    opts?: ApiServiceOptions,
  ): Promise<J | null> {
    return this.request<J>({ method: 'PUT', path, body }, opts);
  }

  public async patch<J extends ClerkResourceJSON | null>(
    path: string,
    body?: any,
    opts?: ApiServiceOptions,
  ): Promise<J | null> {
    return this.request<J>({ method: 'PATCH', path, body }, opts);
  }

  public async delete<J extends ClerkResourceJSON | null>(path: string, opts?: ApiServiceOptions): Promise<J | null> {
    return this.request<J>({ method: 'DELETE', path }, opts);
  }

  public async request<J extends ClerkResourceJSON | DeletedObjectJSON | null>(
    requestInit: FapiRequestInit,
    opts: ApiServiceOptions = {},
  ): Promise<J | null> {
    return FraudProtection.getInstance().execute(this.clerk, async () => {
      try {
        const fapiResponse = await this.fapiClient.request<J>(requestInit, { fetchMaxTries: opts.fetchMaxTries });
        return this.handleResponse<J>(fapiResponse, requestInit.method, opts);
      } catch (e) {
        if (this.shouldRethrowOfflineNetworkErrors()) {
          throw new ClerkRuntimeError(e?.message || String(e), { code: 'network_error' });
        } else if (!isValidBrowserOnline()) {
          console.warn(e);
          return null;
        } else {
          throw e;
        }
      }
    });
  }

  private handleResponse<J extends ClerkResourceJSON | DeletedObjectJSON | null>(
    fapiResponse: FapiResponse<J>,
    method = 'GET',
    opts: ApiServiceOptions = {},
  ): J | null {
    const { payload, status, statusText, headers } = fapiResponse;
    const country = headers?.get('x-country');
    this.clerk.__internal_setCountry(country ? country.toLowerCase() : null);

    // Piggyback client data
    if (method !== 'GET' || opts.forceUpdateClient) {
      this.updateClient(payload);
    }

    if (status >= 200 && status <= 299) {
      return payload as J;
    }

    if (status >= 400) {
      const errors = payload?.errors as ClerkAPIErrorJSON[];
      const message = errors?.[0]?.long_message;
      const code = errors?.[0]?.code;

      // Handle 401
      if (status === 401 && code !== 'requires_captcha') {
        void this.clerk.handleUnauthenticated();
      }

      assertProductionKeysOnDev(status, errors);

      throw new ClerkAPIResponseError(message || statusText, {
        data: errors,
        status: status,
      });
    }

    return null;
  }

  private updateClient<J extends ClerkResourceJSON | DeletedObjectJSON | null>(
    responseJSON: FapiResponseJSON<J> | null,
  ) {
    if (!responseJSON) {
      return;
    }
    const client = responseJSON.client || responseJSON.meta?.client;
    if (client) {
      this.clerk.updateClient(Client.getOrCreateInstance().fromJSON(client));
    }
  }

  private shouldRethrowOfflineNetworkErrors(): boolean {
    const experimental = this.clerk?.__internal_getOption?.('experimental');
    return experimental?.rethrowOfflineNetworkErrors || false;
  }
}

function assertProductionKeysOnDev(statusCode: number, payloadErrors?: ClerkAPIErrorJSON[]) {
  if (!payloadErrors) {
    return;
  }

  if (!payloadErrors[0]) {
    return;
  }

  // const safeError = payloadErrors[0];
  // const safeErrorMessage = safeError.long_message;

  // if (safeError.code === 'origin_invalid' && isProductionFromPublishableKey(BaseResource.clerk.publishableKey)) {
  //   const prodDomain = BaseResource.clerk.frontendApi.replace('clerk.', '');
  //   throw new ClerkAPIResponseError(
  //     `Clerk: Production Keys are only allowed for domain "${prodDomain}". \nAPI Error: ${safeErrorMessage}`,
  //     {
  //       data: payloadErrors,
  //       status: statusCode,
  //     },
  //   );
  // }
}
