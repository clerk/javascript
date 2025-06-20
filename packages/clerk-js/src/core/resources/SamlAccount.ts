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
import { parseJSON, serializeToJSON } from './parser';
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
      ...serializeToJSON(this, {
        nestedFields: ['verification', 'samlConnection'],
      }),
    } as SamlAccountJSONSnapshot;
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
      ...serializeToJSON(this),
    } as SamlAccountConnectionJSONSnapshot;
  }
}
