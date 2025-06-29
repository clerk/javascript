import { titleize } from '@clerk/shared/underscore';
import type {
  ExternalAccountJSON,
  ExternalAccountJSONSnapshot,
  ExternalAccountResource,
  OAuthProvider,
  ReauthorizeExternalAccountParams,
  VerificationResource,
} from '@clerk/types';

import { BaseResource } from './Base';
import { parseJSON } from './parser';
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
    Object.assign(
      this,
      parseJSON<ExternalAccount>(data, {
        nestedFields: {
          verification: Verification,
        },
        customTransforms: {
          provider: (value: string) => (value || '').replace('oauth_', '') as OAuthProvider,
        },
        defaultValues: {
          providerUserId: '',
          emailAddress: '',
          approvedScopes: '',
          firstName: '',
          lastName: '',
          imageUrl: '',
          username: '',
          phoneNumber: '',
          publicMetadata: {},
          label: '',
          verification: null,
        },
      }),
    );
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
