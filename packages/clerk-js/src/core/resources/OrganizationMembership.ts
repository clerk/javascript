import {
  MembershipRole,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

export class OrganizationMembership implements OrganizationMembershipResource {
  id!: string;
  name!: string;
  organizationId!: string;
  userId!: string;
  role!: MembershipRole;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationMembershipJSON): this {
    this.id = data.id;
    this.organizationId = data.organization_id;
    this.userId = data.user_id;
    this.role = data.role;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}
