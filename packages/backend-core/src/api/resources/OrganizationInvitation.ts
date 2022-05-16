import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { OrganizationInvitationJSON } from './JSON';
import type { OrganizationInvitationProps } from './Props';

export interface OrganizationInvitation extends OrganizationInvitationProps {}

export class OrganizationInvitation {
  static attributes = [
    'id',
    'emailAddress',
    'organizationId',
    'role',
    'redirectUrl',
    'status',
    'createdAt',
    'updatedAt',
  ];

  static defaults = [];

  constructor(data: OrganizationInvitationProps) {
    Object.assign(this, OrganizationInvitation.defaults, data);
  }

  static fromJSON(data: OrganizationInvitationJSON): OrganizationInvitation {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, OrganizationInvitation.attributes);
    return new OrganizationInvitation(filtered as OrganizationInvitationProps);
  }
}
