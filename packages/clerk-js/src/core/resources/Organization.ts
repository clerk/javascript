import type {
  CreateOrganizationParams,
  GetMembershipsParams,
  MembershipRole,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationResource,
  UpdateOrganizationParams,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

import { BaseResource, OrganizationInvitation, OrganizationMembership } from './internal';

export class Organization extends BaseResource implements OrganizationResource {
  pathRoot = '/organizations';

  id!: string;
  name!: string;
  slug!: string;
  logoUrl!: string;
  publicMetadata: Record<string, unknown> = {};
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationJSON) {
    super();
    this.fromJSON(data);
  }

  static async create(params: CreateOrganizationParams): Promise<OrganizationResource>;
  /**
   * @deprecated Calling `create` with a string is deprecated. Use an object of type {@link CreateOrganizationParams} instead.
   */
  static async create(name: string): Promise<OrganizationResource>;
  static async create(paramsOrName: string | CreateOrganizationParams): Promise<OrganizationResource> {
    let name;
    let slug;
    if (typeof paramsOrName === 'string') {
      // DX: Deprecated v3.5.2
      name = paramsOrName;
    } else {
      name = paramsOrName.name;
      slug = paramsOrName.slug;
    }
    const json = (
      await BaseResource._fetch<OrganizationJSON>({
        path: '/organizations',
        method: 'POST',
        body: { name, slug } as any,
      })
    )?.response as unknown as OrganizationJSON;

    return new Organization(json);
  }

  update = async (params: UpdateOrganizationParams): Promise<OrganizationResource> => {
    return this._basePatch({
      body: params,
    });
  };

  getMemberships = async (getMemberhipsParams?: GetMembershipsParams): Promise<OrganizationMembership[]> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/memberships`,
      method: 'GET',
      search: getMemberhipsParams as any,
    })
      .then(res => {
        const members = res?.response as unknown as OrganizationMembershipJSON[];
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
        const pendingInvitations = res?.response as unknown as OrganizationInvitationJSON[];
        return pendingInvitations.map(pendingInvitation => new OrganizationInvitation(pendingInvitation));
      })
      .catch(() => []);
  };

  addMember = async ({ userId, role }: AddMemberParams) => {
    return await BaseResource._fetch({
      method: 'POST',
      path: `/organizations/${this.id}/memberships`,
      body: { userId, role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
  };

  inviteMember = async (inviteMemberParams: InviteMemberParams) => {
    return await OrganizationInvitation.create(this.id, inviteMemberParams);
  };

  updateMember = async ({ userId, role }: UpdateMembershipParams): Promise<OrganizationMembership> => {
    return await BaseResource._fetch({
      method: 'PATCH',
      path: `/organizations/${this.id}/memberships/${userId}`,
      body: { role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
  };

  removeMember = async (userId: string): Promise<OrganizationMembership> => {
    return await BaseResource._fetch({
      method: 'DELETE',
      path: `/organizations/${this.id}/memberships/${userId}`,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
  };

  destroy = async (): Promise<void> => {
    return this._baseDelete();
  };

  protected fromJSON(data: OrganizationJSON): this {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.logoUrl = data.logo_url;
    this.publicMetadata = data.public_metadata;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}

export type GetOrganizationParams = {
  limit?: number;
  offset?: number;
};

export type AddMemberParams = {
  userId: string;
  role: MembershipRole;
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
