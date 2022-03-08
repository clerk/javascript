import type {
  GetMembershipsParams,
  MembershipRole,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationResource,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

import {
  BaseResource,
  OrganizationInvitation,
  OrganizationMembership,
} from './internal';

export class Organization extends BaseResource implements OrganizationResource {
  id!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationJSON) {
    super();
    this.fromJSON(data);
  }

  static async create(name: string): Promise<OrganizationResource> {
    const json = (
      await BaseResource._fetch<OrganizationJSON>({
        path: '/organizations',
        method: 'POST',
        body: { name } as any,
      })
    )?.response as unknown as OrganizationJSON;

    return new Organization(json);
  }

  getMemberships = async (
    getMemberhipsParams?: GetMembershipsParams,
  ): Promise<OrganizationMembership[]> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/memberships`,
      method: 'GET',
      search: getMemberhipsParams as any,
    })
      .then(res => {
        const members =
          res?.response as unknown as OrganizationMembershipJSON[];
        return members.map(member => new OrganizationMembership(member));
      })
      .catch(() => []);
  };

  getPendingInvitations = async (): Promise<OrganizationInvitation[]> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/invitations/pending`,
      method: 'GET',
    })
      .then(res => {
        const pendingInvitations =
          res?.response as unknown as OrganizationInvitationJSON[];
        return pendingInvitations.map(
          pendingInvitation => new OrganizationInvitation(pendingInvitation),
        );
      })
      .catch(() => []);
  };

  inviteMember = async (inviteMemberParams: InviteMemberParams) => {
    return await OrganizationInvitation.create(this.id, inviteMemberParams);
  };

  updateMember = async ({
    userId,
    role,
  }: UpdateMembershipParams): Promise<OrganizationMembership> => {
    return await BaseResource._fetch({
      method: 'PATCH',
      path: `/organizations/${this.id}/memberships/${userId}`,
      body: { role } as any,
    }).then(
      res =>
        new OrganizationMembership(res?.response as OrganizationMembershipJSON),
    );
  };

  removeMember = async (userId: string): Promise<OrganizationMembership> => {
    return await BaseResource._fetch({
      method: 'DELETE',
      path: `/organizations/${this.id}/memberships/${userId}`,
    }).then(
      res =>
        new OrganizationMembership(res?.response as OrganizationMembershipJSON),
    );
  };

  protected fromJSON(data: OrganizationJSON): this {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}

export type GetOrganizationParams = {
  limit?: number;
  offset?: number;
};

export type InviteMemberParams = {
  emailAddress: string;
  role: MembershipRole;
  redirectUrl?: string;
};

export type UpdateMembershipParams = {
  userId: string;
  role: MembershipRole;
};
