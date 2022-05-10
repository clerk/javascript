import camelcaseKeys from 'camelcase-keys';

import { Organization } from '../resources';
import filterKeys from '../utils/Filter';
import type { OrganizationMembershipJSON, OrganizationMembershipPublicUserDataJSON } from './JSON';
import type { OrganizationMembershipProps, OrganizationMembershipPublicUserDataProps } from './Props';

export interface OrganizationMembership extends OrganizationMembershipProps {
  organization: Organization;
  publicUserData: OrganizationMembershipPublicUserData;
}

export class OrganizationMembership {
  static attributes = ['id', 'role', 'organization', 'publicUserData', 'createdAt', 'updatedAt'];

  static defaults = [];

  constructor(data: OrganizationMembershipProps) {
    Object.assign(this, OrganizationMembership.defaults, data);
  }

  static fromJSON(data: OrganizationMembershipJSON): OrganizationMembership {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, OrganizationMembership.attributes);
    filtered.organization = Organization.fromJSON(data.organization);
    filtered.publicUserData = OrganizationMembershipPublicUserData.fromJSON(data.public_user_data);
    return new OrganizationMembership(filtered as OrganizationMembershipProps);
  }
}

export interface OrganizationMembershipPublicUserData extends OrganizationMembershipPublicUserDataProps {}

export class OrganizationMembershipPublicUserData {
  static attributes = ['identifier', 'firstName', 'lastName', 'profileImageUrl', 'userId'];
  static defaults = [];

  constructor(data: Partial<OrganizationMembershipPublicUserDataProps> = {}) {
    Object.assign(this, OrganizationMembershipPublicUserData.defaults, data);
  }

  static fromJSON(data: OrganizationMembershipPublicUserDataJSON): OrganizationMembershipPublicUserData {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, OrganizationMembershipPublicUserData.attributes);
    return new OrganizationMembershipPublicUserData(filtered as OrganizationMembershipPublicUserDataProps);
  }
}
