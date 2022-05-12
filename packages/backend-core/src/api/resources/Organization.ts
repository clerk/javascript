import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { OrganizationJSON } from './JSON';
import type { OrganizationProps } from './Props';

interface OrganizationPayload extends OrganizationProps {}

export interface Organization extends OrganizationPayload {}

export class Organization {
  static attributes = ['id', 'name', 'slug', 'publicMetadata', 'privateMetadata', 'createdAt', 'updatedAt'];

  static defaults = [];

  constructor(data: Partial<OrganizationProps> = {}) {
    Object.assign(this, Organization.defaults, data);
  }

  static fromJSON(data: OrganizationJSON): Organization {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, Organization.attributes);
    return new Organization(filtered as OrganizationPayload);
  }
}
