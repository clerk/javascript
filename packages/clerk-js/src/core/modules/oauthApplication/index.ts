import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  GetOAuthConsentInfoParams,
  OAuthApplicationNamespace,
  OAuthConsentInfo,
  OAuthConsentInfoJSON,
} from '@clerk/shared/types';

import { BaseResource } from '../../resources/internal';

export class OAuthApplication implements OAuthApplicationNamespace {
  async getConsentInfo(params: GetOAuthConsentInfoParams): Promise<OAuthConsentInfo> {
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

    const data = json.response ?? json;
    return {
      oauthApplicationName: data.oauth_application_name,
      oauthApplicationLogoUrl: data.oauth_application_logo_url,
      oauthApplicationUrl: data.oauth_application_url,
      clientId: data.client_id,
      state: data.state,
      scopes:
        data.scopes?.map(s => ({
          scope: s.scope,
          description: s.description,
          requiresConsent: s.requires_consent,
        })) ?? [],
    };
  }

  buildConsentActionUrl({ clientId }: { clientId: string }): string {
    const url = BaseResource.fapiClient.buildUrl({
      path: `/me/oauth/consent/${encodeURIComponent(clientId)}`,
      sessionId: BaseResource.clerk.session?.id,
    });
    return BaseResource.clerk.buildUrlWithAuth(url.toString());
  }
}
