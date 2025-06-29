import type {
  SamlAccountConnectionJSON,
  SamlAccountConnectionJSONSnapshot,
  SamlAccountConnectionResource,
  SamlAccountJSON,
  SamlAccountJSONSnapshot,
  SamlAccountResource,
  SamlIdpSlug,
  VerificationResource,
} from '@clerk/types';

import { BaseResource } from './Base';
import { parseJSON } from './parser';
import { Verification } from './Verification';

export class SamlAccount extends BaseResource implements SamlAccountResource {
  id!: string;
  provider: SamlIdpSlug = 'saml_custom';
  providerUserId: string | null = null;
  active = false;
  emailAddress = '';
  firstName = '';
  lastName = '';
  verification: VerificationResource | null = null;
  samlConnection: SamlAccountConnectionResource | null = null;

  public constructor(data: Partial<SamlAccountJSON | SamlAccountJSONSnapshot>, pathRoot: string);
  public constructor(data: SamlAccountJSON | SamlAccountJSONSnapshot, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  protected fromJSON(data: SamlAccountJSON | SamlAccountJSONSnapshot | null): this {
    Object.assign(
      this,
      parseJSON<SamlAccount>(data, {
        nestedFields: {
          verification: Verification,
          samlConnection: SamlAccountConnection,
        },
        defaultValues: {
          provider: 'saml_custom',
          providerUserId: null,
          active: false,
          emailAddress: '',
          firstName: '',
          lastName: '',
          verification: null,
          samlConnection: null,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): SamlAccountJSONSnapshot {
    return {
      object: 'saml_account',
      id: this.id,
      provider: this.provider,
      provider_user_id: this.providerUserId,
      active: this.active,
      email_address: this.emailAddress,
      first_name: this.firstName,
      last_name: this.lastName,
      verification: this.verification?.__internal_toSnapshot() || null,
      saml_connection: this.samlConnection?.__internal_toSnapshot(),
    };
  }
}

export class SamlAccountConnection extends BaseResource implements SamlAccountConnectionResource {
  id!: string;
  name!: string;
  domain!: string;
  active!: boolean;
  provider!: string;
  syncUserAttributes!: boolean;
  allowSubdomains!: boolean;
  allowIdpInitiated!: boolean;
  disableAdditionalIdentifications!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: SamlAccountConnectionJSON | SamlAccountConnectionJSONSnapshot | null) {
    super();
    this.fromJSON(data);
  }
  protected fromJSON(data: SamlAccountConnectionJSON | SamlAccountConnectionJSONSnapshot | null): this {
    Object.assign(
      this,
      parseJSON<SamlAccountConnection>(data, {
        dateFields: ['createdAt', 'updatedAt'],
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): SamlAccountConnectionJSONSnapshot {
    return {
      object: 'saml_account_connection',
      id: this.id,
      name: this.name,
      domain: this.domain,
      active: this.active,
      provider: this.provider,
      sync_user_attributes: this.syncUserAttributes,
      allow_subdomains: this.allowSubdomains,
      allow_idp_initiated: this.allowIdpInitiated,
      disable_additional_identifications: this.disableAdditionalIdentifications,
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }
}
