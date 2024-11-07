import type {
  EnterpriseAccountConnectionJSON,
  EnterpriseAccountConnectionResource,
  EnterpriseAccountJSON,
  EnterpriseAccountResource,
  VerificationResource,
} from '@clerk/types';

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
  firstName = '';
  lastName = '';
  publicMetadata = {};
  verification: VerificationResource | null = null;
  enterpriseConnection: EnterpriseAccountConnectionResource | null = null;

  public constructor(data: Partial<EnterpriseAccountJSON>, pathRoot: string);
  public constructor(data: EnterpriseAccountJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  protected fromJSON(data: EnterpriseAccountJSON | null): this {
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

    if (data.verification) {
      this.verification = new Verification(data.verification);
    }

    if (data.enterprise_connection) {
      this.enterpriseConnection = new EnterpriseAccountConnection(data.enterprise_connection);
    }

    return this;
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

  constructor(data: EnterpriseAccountConnectionJSON | null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: EnterpriseAccountConnectionJSON | null): this {
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
    }

    return this;
  }
}
