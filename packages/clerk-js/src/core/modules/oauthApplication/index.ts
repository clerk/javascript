import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  GetOAuthConsentInfoParams,
  OAuthApplicationInfo,
  OAuthApplicationJSON,
  OAuthApplicationNamespace,
  OAuthConsentInfo,
  OAuthConsentInfoJSON,
} from '@clerk/shared/types';

import { BaseResource } from '../../resources/internal';

export class OAuthApplication implements OAuthApplicationNamespace {
  async getApplications(): Promise<OAuthApplicationInfo[]> {
    const json = await BaseResource._fetch<OAuthApplicationJSON[]>(
      {
        method: 'GET',
        path: '/me/oauth_applications',
      },
      { skipUpdateClient: true },
    );

    if (!json) {
      throw new ClerkRuntimeError('Network request failed while offline', { code: 'network_error' });
    }

    const data = json.response ?? json;
    return data.map(application => ({
      object: application.object,
      id: application.id,
      name: application.name,
      clientUri: application.client_uri,
      clientImageUrl: application.client_image_url,
    }));
  }

  async getConsentInfo(params: GetOAuthConsentInfoParams): Promise<OAuthConsentInfo> {
    const { oauthClientId, scope, redirectUri } = params;
    const search = {
      ...(scope !== undefined && { scope }),
      ...(redirectUri !== undefined && { redirect_uri: redirectUri }),
    };
    const json = await BaseResource._fetch<OAuthConsentInfoJSON>(
      {
        method: 'GET',
        path: `/me/oauth/consent/${encodeURIComponent(oauthClientId)}`,
        search: Object.keys(search).length > 0 ? search : undefined,
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
      redirectDomain: data.redirect_domain,
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
