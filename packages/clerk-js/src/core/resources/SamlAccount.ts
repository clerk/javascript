import type {
  SamlAccountConnectionJSON,
  SamlAccountConnectionResource,
  SamlAccountJSON,
  SamlAccountResource,
  SamlIdpSlug,
  VerificationResource,
} from '@clerk/types';

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

  public constructor(data: Partial<SamlAccountJSON>, pathRoot: string);
  public constructor(data: SamlAccountJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  protected fromJSON(data: SamlAccountJSON | null): this {
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

    if (data.verification) {
      this.verification = new Verification(data.verification);
    }

    if (data.saml_connection) {
      this.samlConnection = new SamlAccountConnection(data.saml_connection);
    }

    return this;
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

  constructor(data: SamlAccountConnectionJSON | null) {
    super();
    this.fromJSON(data);
  }
  protected fromJSON(data: SamlAccountConnectionJSON | null): this {
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
}
