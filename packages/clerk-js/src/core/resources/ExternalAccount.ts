import type {
  ExternalAccountJSON,
  ExternalAccountJSONSnapshot,
  ExternalAccountResource,
  OAuthProvider,
  OAuthStrategy,
  ReauthorizeExternalAccountParams,
  VerificationResource,
} from '@clerk/shared/types';
import { titleize } from '@clerk/shared/underscore';

import { getOAuthTransportRedirectUrl } from '../../utils/authenticateWithTransport';
import { completeExternalAccountWithTransport } from '../../utils/completeExternalAccountWithTransport';
import { BaseResource } from './Base';
import { Verification } from './Verification';

export class ExternalAccount extends BaseResource implements ExternalAccountResource {
  id!: string;
  createdAt: Date | undefined;
  identificationId!: string;
  provider!: OAuthProvider;
  providerUserId = '';
  emailAddress = '';
  approvedScopes = '';
  firstName = '';
  lastName = '';
  imageUrl = '';
  username = '';
  phoneNumber = '';
  publicMetadata = {};
  label = '';
  verification: VerificationResource | null = null;

  public constructor(data: Partial<ExternalAccountJSON | ExternalAccountJSONSnapshot>, pathRoot: string);
  public constructor(data: ExternalAccountJSON | ExternalAccountJSONSnapshot, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  reauthorize = async (params: ReauthorizeExternalAccountParams): Promise<ExternalAccountResource> => {
    const { additionalScopes, redirectUrl, oidcPrompt, oidcLoginHint } = params || {};
    const transport = ExternalAccount.clerk?.__internal_oauthTransport;
    const owner = ExternalAccount.clerk?.user;
    const ownerId = owner?.id;
    if (transport && owner && this.verification?.error) {
      const approved = new Set((this.approvedScopes || '').split(' '));
      const needsAdditionalScopes = additionalScopes?.some(scope => !approved.has(scope)) ?? false;
      if (!needsAdditionalScopes) {
        const strategy: OAuthStrategy = `oauth_${this.provider}`;
        return owner.createExternalAccount({ strategy, additionalScopes, oidcPrompt, oidcLoginHint });
      }
    }
    const callback = transport ? await getOAuthTransportRedirectUrl(transport) : redirectUrl;

    const account = await this._basePatch({
      action: 'reauthorize',
      body: {
        additional_scope: additionalScopes,
        redirect_url: callback,
        oidc_prompt: oidcPrompt,
        oidc_login_hint: oidcLoginHint,
      },
    });
    return transport
      ? completeExternalAccountWithTransport(ExternalAccount.clerk, account, ownerId || '', callback)
      : account;
  };
  destroy = (): Promise<void> => this._baseDelete();

  protected fromJSON(data: ExternalAccountJSON | ExternalAccountJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.createdAt = data.created_at == null ? undefined : new Date(data.created_at);
    this.identificationId = data.identification_id;
    this.providerUserId = data.provider_user_id;
    this.approvedScopes = data.approved_scopes;
    this.imageUrl = data.image_url;
    this.emailAddress = data.email_address;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    // TODO: Send the provider name the `oauth` prefix from FAPI
    this.provider = (data.provider || '').replace('oauth_', '') as OAuthProvider;
    this.username = data.username;
    this.phoneNumber = data.phone_number;
    this.publicMetadata = data.public_metadata;
    this.label = data.label;

    if (data.verification) {
      this.verification = new Verification(data.verification);
    }
    return this;
  }

  public __internal_toSnapshot(): ExternalAccountJSONSnapshot {
    return {
      object: 'external_account',
      id: this.id,
      created_at: this.createdAt?.getTime(),
      identification_id: this.identificationId,
      provider: this.provider,
      provider_user_id: this.providerUserId,
      email_address: this.emailAddress,
      approved_scopes: this.approvedScopes,
      first_name: this.firstName,
      last_name: this.lastName,
      image_url: this.imageUrl,
      username: this.username,
      phone_number: this.phoneNumber,
      public_metadata: this.publicMetadata,
      label: this.label,
      verification: this.verification?.__internal_toSnapshot() || null,
    };
  }

  providerSlug(): OAuthProvider {
    return this.provider;
  }

  providerTitle(): string {
    return [titleize(this.providerSlug()), 'Account'].join(' ');
  }

  accountIdentifier(): string {
    return this.username || this.emailAddress || this.label;
  }
}
