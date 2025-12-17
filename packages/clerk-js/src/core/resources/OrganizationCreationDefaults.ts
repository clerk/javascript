import type {
  OrganizationCreationDefaultsJSON,
  OrganizationCreationDefaultsJSONSnapshot,
  OrganizationCreationDefaultsResource,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

export class OrganizationCreationDefaults extends BaseResource implements OrganizationCreationDefaultsResource {
  creationAdvisory: {
    type: 'existing_org_with_domain';
    severity: 'warning';
  } | null = null;

  public constructor(data: OrganizationCreationDefaultsJSON | OrganizationCreationDefaultsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationCreationDefaultsJSON | OrganizationCreationDefaultsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    if (data.creation_advisory) {
      this.creationAdvisory = this.withDefault(data.creation_advisory, this.creationAdvisory ?? null);
    }

    return this;
  }

  static async retrieve(): Promise<OrganizationCreationDefaultsResource> {
    return await BaseResource._fetch({
      path: '/me/organization_creation_defaults',
      method: 'GET',
    }).then(res => {
      const data = res?.response as unknown as OrganizationCreationDefaultsJSON;
      return new OrganizationCreationDefaults(data);
    });
  }

  public __internal_toSnapshot(): OrganizationCreationDefaultsJSONSnapshot {
    return {
      creation_advisory: this.creationAdvisory
        ? {
            type: this.creationAdvisory.type,
            severity: this.creationAdvisory.severity,
          }
        : null,
    } as unknown as OrganizationCreationDefaultsJSONSnapshot;
  }
}
