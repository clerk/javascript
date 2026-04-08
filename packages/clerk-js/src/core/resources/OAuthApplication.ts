import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  ClerkResourceJSON,
  FetchOAuthConsentInfoParams,
  OAuthConsentInfo,
  OAuthConsentInfoJSON,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

export class OAuthApplication extends BaseResource {
  pathRoot = '';

  protected fromJSON(_data: ClerkResourceJSON | null): this {
    return this;
  }

  static async fetchConsentInfo(params: FetchOAuthConsentInfoParams): Promise<OAuthConsentInfo> {
    const { oauthClientId, scope } = params;
    const json = await BaseResource._fetch<OAuthConsentInfoJSON>(
      {
        method: 'GET',
        path: `/me/oauth/consent/${encodeURIComponent(oauthClientId)}`,
        search: scope !== undefined ? { scope } : undefined,
      },
      { skipUpdateClient: true },
    );

    if (!json) {
      throw new ClerkRuntimeError('Network request failed while offline', { code: 'network_error' });
    }

    const envelope = json;
    const data = envelope.response ?? json;
    return {
      oauth_application_name: data.oauth_application_name,
      oauth_application_logo_url: data.oauth_application_logo_url,
      oauth_application_url: data.oauth_application_url,
      client_id: data.client_id,
      state: data.state,
      scopes: data.scopes ?? [],
    };
  }
}
