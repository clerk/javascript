import type {
  EnterpriseAccountConnectionJSON,
  EnterpriseAccountConnectionJSONSnapshot,
  EnterpriseAccountConnectionResource,
  EnterpriseAccountJSON,
  EnterpriseAccountJSONSnapshot,
  EnterpriseAccountResource,
  EnterpriseProvider,
  VerificationResource,
} from '@clerk/types';

import { BaseResource } from './Base';
import { parseJSON, serializeToJSON } from './parser';
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

    Object.assign(
      this,
      parseJSON<EnterpriseAccountResource>(data, {
        nestedFields: {
          verification: Verification,
          enterpriseConnection: EnterpriseAccountConnection,
        },
        defaultValues: {
          emailAddress: '',
          firstName: '',
          lastName: '',
          publicMetadata: {},
          providerUserId: null,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): EnterpriseAccountJSONSnapshot {
    return {
      object: 'enterprise_account',
      ...serializeToJSON(this, {
        nestedFields: ['verification', 'enterpriseConnection'],
      }),
    } as EnterpriseAccountJSONSnapshot;
  }
}

export class EnterpriseAccountConnection extends BaseResource implements EnterpriseAccountConnectionResource {
  id!: string;
  provider!: EnterpriseProvider;
  name!: string;
  domains!: string[];
  sync!: boolean;
  active!: boolean;
  setupStatus!: string;
  publicMetadata = {};
  protocol!: EnterpriseAccountResource['protocol'];
  allowIdpInitiated = false;
  allowSubdomains = false;
  disableAdditionalIdentifications = false;
  domain!: string;
  logoPublicUrl: string | null = '';
  syncUserAttributes = false;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: EnterpriseAccountConnectionJSON | EnterpriseAccountConnectionJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: EnterpriseAccountConnectionJSON | EnterpriseAccountConnectionJSONSnapshot | null): this {
    Object.assign(
      this,
      parseJSON<EnterpriseAccountConnectionResource>(data, {
        dateFields: ['createdAt', 'updatedAt'],
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): EnterpriseAccountConnectionJSONSnapshot {
    return {
      object: 'enterprise_account_connection',
      ...serializeToJSON(this),
    } as EnterpriseAccountConnectionJSONSnapshot;
  }
}
