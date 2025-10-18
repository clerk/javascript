import type {
  SamlAccountConnectionJSON,
  SamlAccountConnectionJSONSnapshot,
  SamlAccountConnectionResource,
  SamlAccountJSON,
  SamlAccountJSONSnapshot,
  SamlAccountResource,
  SamlIdpSlug,
  VerificationResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';
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
  lastAuthenticatedAt: Date | null = null;
  enterpriseConnectionId: string | null = null;

  public constructor(data: Partial<SamlAccountJSON | SamlAccountJSONSnapshot>, pathRoot: string);
  public constructor(data: SamlAccountJSON | SamlAccountJSONSnapshot, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  protected fromJSON(data: SamlAccountJSON | SamlAccountJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.provider = data.provider;
    this.providerUserId = data.provider_user_id;
    this.active = data.active;
    this.emailAddress = data.email_address;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.enterpriseConnectionId = data.enterprise_connection_id;

    if (data.verification) {
      this.verification = new Verification(data.verification);
    }

    if (data.saml_connection) {
      this.samlConnection = new SamlAccountConnection(data.saml_connection);
    }

    this.lastAuthenticatedAt = data.last_authenticated_at ? unixEpochToDate(data.last_authenticated_at) : null;

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
      enterprise_connection_id: this.enterpriseConnectionId,
      last_authenticated_at: this.lastAuthenticatedAt ? this.lastAuthenticatedAt.getTime() : null,
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
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.domain = data.domain;
      this.active = data.active;
      this.provider = data.provider;
      this.syncUserAttributes = data.sync_user_attributes;
      this.allowSubdomains = data.allow_subdomains;
      this.allowIdpInitiated = data.allow_idp_initiated;
      this.disableAdditionalIdentifications = data.disable_additional_identifications;
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
    }

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
