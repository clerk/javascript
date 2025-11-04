import type {
  EnterpriseAccountConnectionJSON,
  EnterpriseAccountConnectionJSONSnapshot,
  EnterpriseAccountConnectionResource,
  EnterpriseAccountJSON,
  EnterpriseAccountJSONSnapshot,
  EnterpriseAccountResource,
  VerificationResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';
import { Verification } from './Verification';

export class EnterpriseAccount extends BaseResource implements EnterpriseAccountResource {
  id!: string;
  protocol!: EnterpriseAccountResource['protocol'];
  provider!: EnterpriseAccountResource['provider'];
  providerUserId: string | null = null;
  active!: boolean;
  emailAddress = '';
  firstName: string | null = '';
  lastName: string | null = '';
  publicMetadata = {};
  verification: VerificationResource | null = null;
  enterpriseConnection: EnterpriseAccountConnectionResource | null = null;
  lastAuthenticatedAt: Date | null = null;
  enterpriseConnectionId: string | null = null;

  public constructor(data: Partial<EnterpriseAccountJSON | EnterpriseAccountJSONSnapshot>, pathRoot: string);
  public constructor(data: EnterpriseAccountJSON | EnterpriseAccountJSONSnapshot, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  protected fromJSON(data: EnterpriseAccountJSON | EnterpriseAccountJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.provider = data.provider;
    this.protocol = data.protocol;
    this.providerUserId = data.provider_user_id;
    this.active = data.active;
    this.emailAddress = data.email_address;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.publicMetadata = data.public_metadata;
    this.lastAuthenticatedAt = data.last_authenticated_at ? unixEpochToDate(data.last_authenticated_at) : null;
    this.enterpriseConnectionId = data.enterprise_connection_id;
    if (data.verification) {
      this.verification = new Verification(data.verification);
    }

    if (data.enterprise_connection) {
      this.enterpriseConnection = new EnterpriseAccountConnection(data.enterprise_connection);
    }

    return this;
  }

  public __internal_toSnapshot(): EnterpriseAccountJSONSnapshot {
    return {
      object: 'enterprise_account',
      id: this.id,
      provider: this.provider,
      protocol: this.protocol,
      provider_user_id: this.providerUserId,
      active: this.active,
      email_address: this.emailAddress,
      first_name: this.firstName,
      last_name: this.lastName,
      public_metadata: this.publicMetadata,
      verification: this.verification?.__internal_toSnapshot() || null,
      enterprise_connection: this.enterpriseConnection?.__internal_toSnapshot() || null,
      last_authenticated_at: this.lastAuthenticatedAt ? this.lastAuthenticatedAt.getTime() : null,
      enterprise_connection_id: this.enterpriseConnectionId,
    };
  }
}

export class EnterpriseAccountConnection extends BaseResource implements EnterpriseAccountConnectionResource {
  id!: string;
  active!: boolean;
  allowIdpInitiated!: boolean;
  allowSubdomains!: boolean;
  disableAdditionalIdentifications!: boolean;
  domain!: string;
  logoPublicUrl: string | null = '';
  name!: string;
  protocol!: EnterpriseAccountResource['protocol'];
  provider!: EnterpriseAccountResource['provider'];
  syncUserAttributes!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  enterpriseConnectionId: string | null = '';

  constructor(data: EnterpriseAccountConnectionJSON | EnterpriseAccountConnectionJSONSnapshot | null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: EnterpriseAccountConnectionJSON | EnterpriseAccountConnectionJSONSnapshot | null): this {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.domain = data.domain;
      this.active = data.active;
      this.provider = data.provider;
      this.logoPublicUrl = data.logo_public_url;
      this.syncUserAttributes = data.sync_user_attributes;
      this.allowSubdomains = data.allow_subdomains;
      this.allowIdpInitiated = data.allow_idp_initiated;
      this.disableAdditionalIdentifications = data.disable_additional_identifications;
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
      this.enterpriseConnectionId = data.enterprise_connection_id;
    }

    return this;
  }

  public __internal_toSnapshot(): EnterpriseAccountConnectionJSONSnapshot {
    return {
      object: 'enterprise_account_connection',
      id: this.id,
      name: this.name,
      domain: this.domain,
      active: this.active,
      protocol: this.protocol,
      provider: this.provider,
      logo_public_url: this.logoPublicUrl,
      sync_user_attributes: this.syncUserAttributes,
      allow_subdomains: this.allowSubdomains,
      allow_idp_initiated: this.allowIdpInitiated,
      disable_additional_identifications: this.disableAdditionalIdentifications,
      enterprise_connection_id: this.enterpriseConnectionId,
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }
}
