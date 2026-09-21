import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  ClerkResourceJSON,
  GetOAuthConsentInfoParams,
  LookupOAuthDeviceVerificationParams,
  OAuthApplicationNamespace,
  OAuthConsentInfo,
  OAuthConsentInfoJSON,
  OAuthDeviceVerificationInfo,
  OAuthDeviceVerificationInfoJSON,
  OAuthDeviceVerificationResult,
  OAuthDeviceVerificationResultJSON,
  SubmitOAuthDeviceVerificationParams,
} from '@clerk/shared/types';

import { BaseResource } from '../../resources/internal';

export class OAuthApplication implements OAuthApplicationNamespace {
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

  async lookupDeviceVerification(params: LookupOAuthDeviceVerificationParams): Promise<OAuthDeviceVerificationInfo> {
    const json = await BaseResource._fetch<OAuthDeviceVerificationInfoJSON & ClerkResourceJSON>(
      {
        method: 'POST',
        path: '/me/oauth/device/lookup',
        body: { userCode: params.userCode } as any,
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
      clientId: data.client_id,
      scopes:
        data.scopes?.map(scope => ({
          scope: scope.scope,
          description: scope.description,
          requiresConsent: scope.requires_consent,
        })) ?? [],
      status: data.status,
      expiresAt: data.expires_at,
    };
  }

  async submitDeviceVerification(params: SubmitOAuthDeviceVerificationParams): Promise<OAuthDeviceVerificationResult> {
    const json = await BaseResource._fetch<OAuthDeviceVerificationResultJSON & ClerkResourceJSON>(
      {
        method: 'POST',
        path: '/me/oauth/device',
        body: {
          userCode: params.userCode,
          approved: params.approved,
          organizationId: params.organizationId,
        } as any,
      },
      { skipUpdateClient: true },
    );

    if (!json) {
      throw new ClerkRuntimeError('Network request failed while offline', { code: 'network_error' });
    }

    const data = json.response ?? json;
    return {
      object: data.object,
      status: data.status,
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
