import type { SamlAccountJSON, SamlAccountResource, VerificationResource } from '@clerk/types';

import { BaseResource } from './Base';
import { Verification } from './Verification';

export class SamlAccount extends BaseResource implements SamlAccountResource {
  id!: string;
  provider = '';
  emailAddress = '';
  firstName = '';
  lastName = '';
  verification: VerificationResource | null = null;

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
    this.emailAddress = data.email_address;
    this.firstName = data.first_name;
    this.lastName = data.last_name;

    if (data.verification) {
      this.verification = new Verification(data.verification);
    }

    return this;
  }
}
