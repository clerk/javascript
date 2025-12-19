import type {
  OrganizationCreationAdvisorySeverity,
  OrganizationCreationAdvisoryType,
  OrganizationCreationDefaultsJSON,
  OrganizationCreationDefaultsJSONSnapshot,
  OrganizationCreationDefaultsResource,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

export class OrganizationCreationDefaults extends BaseResource implements OrganizationCreationDefaultsResource {
  advisory: {
    code: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
    meta: Record<string, string>;
  } | null = null;
  form: {
    name: string;
    slug: string;
    logo: string | null;
  } = {
    name: '',
    slug: '',
    logo: null,
  };

  public constructor(data: OrganizationCreationDefaultsJSON | OrganizationCreationDefaultsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationCreationDefaultsJSON | OrganizationCreationDefaultsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    if (data.advisory) {
      this.advisory = this.withDefault(data.advisory, this.advisory ?? null);
    }

    if (data.form) {
      this.form.name = this.withDefault(data.form.name, this.form.name);
      this.form.slug = this.withDefault(data.form.slug, this.form.slug);
      this.form.logo = this.withDefault(data.form.logo, this.form.logo);
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
      advisory: this.advisory
        ? {
            code: this.advisory.code,
            meta: this.advisory.meta,
            severity: this.advisory.severity,
          }
        : null,
    } as unknown as OrganizationCreationDefaultsJSONSnapshot;
  }
}
