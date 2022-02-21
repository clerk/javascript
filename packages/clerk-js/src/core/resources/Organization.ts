import type {
  GetMembersParams,
  MemberRole,
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
  instanceId!: string;
  createdBy!: string;
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

  static retrieve(
    getOrganizationParams?: GetOrganizationParams,
  ): Promise<Organization[]> {
    return this.clerk
      .getFapiClient()
      .request<OrganizationJSON[]>({
        method: 'GET',
        path: '/me/organizations',
        // @ts-ignore
        search: getOrganizationParams,
      })
      .then(res => {
        const organizationsJSON = res.payload
          ?.response as unknown as OrganizationJSON[];
        return organizationsJSON.map(org => new Organization(org));
      });
  }

  getMembers = async (
    getMemberParams?: GetMembersParams,
  ): Promise<OrganizationMembership[]> => {
    // @ts-ignore
    return await BaseResource._fetch<OrganizationMembershipJSON[]>({
      path: `/organizations/${this.id}/memberships`,
      method: 'GET',
      search: getMemberParams,
    })
      .then(res => {
        const members = res?.response as OrganizationMembershipJSON[];
        return members.map(member => new OrganizationMembership(member));
      })
      .catch(() => []);
  };

  getPendingInvitations = async (): Promise<OrganizationInvitation> => {
    // @ts-ignore
    return await BaseResource._fetch<OrganizationInvitationJSON[]>({
      path: `/organizations/${this.id}/invitations/pending`,
      method: 'GET',
    })
      .then(res => {
        const pendingInvitations =
          res?.response as OrganizationInvitationJSON[];
        return pendingInvitations.map(
          pendingInvitation => new OrganizationInvitation(pendingInvitation),
        );
      })
      .catch(() => []);
  };

  inviteUser = async (inviteUserParams: InviteUserParams) => {
    return await OrganizationInvitation.create(this.id, inviteUserParams);
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

  removeMember = async (userId: string) => {
    return await this._baseDelete({
      path: `/organizations/${this.id}/memberships/${userId}`,
    });
  };

  protected fromJSON(data: OrganizationJSON): this {
    this.id = data.id;
    this.name = data.name;
    this.instanceId = data.instance_id;
    this.createdBy = data.created_by;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}

export type GetOrganizationParams = {
  limit: number;
  offset: number;
};

export type InviteUserParams = {
  emailAddress: string;
  role: MemberRole;
  redirectUrl?: string;
};

export type UpdateMembershipParams = {
  userId: string;
  role: MemberRole;
};
