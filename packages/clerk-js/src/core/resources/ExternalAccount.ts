import type {
  ExternalAccountJSON,
  ExternalAccountJSONSnapshot,
  ExternalAccountResource,
  OAuthProvider,
  ReauthorizeExternalAccountParams,
  VerificationResource,
} from '@clerk/shared/types';
import { titleize } from '@clerk/shared/underscore';

import { BaseResource } from './Base';
import { Verification } from './Verification';

export class ExternalAccount extends BaseResource implements ExternalAccountResource {
  id!: string;
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

  reauthorize = (params: ReauthorizeExternalAccountParams): Promise<ExternalAccountResource> => {
    const { additionalScopes, redirectUrl } = params || {};

    return this._basePatch({
      action: 'reauthorize',
      body: { additional_scope: additionalScopes, redirect_url: redirectUrl },
    });
  };
  destroy = (): Promise<void> => this._baseDelete();

  protected fromJSON(data: ExternalAccountJSON | ExternalAccountJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
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
