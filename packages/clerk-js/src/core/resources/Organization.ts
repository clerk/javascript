import type {
  AddMemberParams,
  ClerkResourceReloadParams,
  CreateOrganizationParams,
  GetMembershipsParams,
  GetPendingInvitationsParams,
  InviteMemberParams,
  InviteMembersParams,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationResource,
  SetOrganizationLogoParams,
  UpdateMembershipParams,
  UpdateOrganizationParams,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource, OrganizationInvitation, OrganizationMembership } from './internal';

export class Organization extends BaseResource implements OrganizationResource {
  pathRoot = '/organizations';

  id!: string;
  name!: string;
  slug!: string;
  logoUrl!: string;
  imageUrl!: string;
  publicMetadata: OrganizationPublicMetadata = {};
  adminDeleteEnabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  membersCount = 0;
  pendingInvitationsCount = 0;

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

  getPendingInvitations = async (
    getPendingInvitationsParams?: GetPendingInvitationsParams,
  ): Promise<OrganizationInvitation[]> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/invitations/pending`,
      method: 'GET',
      search: getPendingInvitationsParams as any,
    })
      .then(res => {
        const pendingInvitations = res?.response as unknown as OrganizationInvitationJSON[];
        return pendingInvitations.map(pendingInvitation => new OrganizationInvitation(pendingInvitation));
      })
      .catch(() => []);
  };

  addMember = async ({ userId, role }: AddMemberParams) => {
    const newMember = await BaseResource._fetch({
      method: 'POST',
      path: `/organizations/${this.id}/memberships`,
      body: { userId, role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
    OrganizationMembership.clerk.__unstable__membershipUpdate(newMember);
    return newMember;
  };

  inviteMember = async (params: InviteMemberParams) => {
    return OrganizationInvitation.create(this.id, params);
  };

  inviteMembers = async (params: InviteMembersParams) => {
    return OrganizationInvitation.createBulk(this.id, params);
  };

  updateMember = async ({ userId, role }: UpdateMembershipParams): Promise<OrganizationMembership> => {
    const updatedMember = await BaseResource._fetch({
      method: 'PATCH',
      path: `/organizations/${this.id}/memberships/${userId}`,
      body: { role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
    OrganizationMembership.clerk.__unstable__membershipUpdate(updatedMember);
    return updatedMember;
  };

  removeMember = async (userId: string): Promise<OrganizationMembership> => {
    const deletedMember = await BaseResource._fetch({
      method: 'DELETE',
      path: `/organizations/${this.id}/memberships/${userId}`,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
    OrganizationMembership.clerk.__unstable__membershipUpdate(deletedMember);
    return deletedMember;
  };

  destroy = async (): Promise<void> => {
    return this._baseDelete();
  };

  setLogo = async ({ file }: SetOrganizationLogoParams): Promise<OrganizationResource> => {
    if (file === null) {
      return await BaseResource._fetch({
        path: `/organizations/${this.id}/logo`,
        method: 'DELETE',
      }).then(res => new Organization(res?.response as OrganizationJSON));
    }

    let body;
    let headers;
    if (typeof file === 'string') {
      body = file;
      headers = new Headers({
        'Content-Type': 'application/octet-stream',
      });
    } else {
      body = new FormData();
      body.append('file', file);
    }

    return await BaseResource._fetch({
      path: `/organizations/${this.id}/logo`,
      method: 'PUT',
      body,
      headers,
    }).then(res => new Organization(res?.response as OrganizationJSON));
  };

  protected fromJSON(data: OrganizationJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.logoUrl = data.logo_url;
    this.imageUrl = data.image_url;
    this.publicMetadata = data.public_metadata;
    this.membersCount = data.members_count;
    this.pendingInvitationsCount = data.pending_invitations_count;
    this.adminDeleteEnabled = data.admin_delete_enabled;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }

  public async reload(params?: ClerkResourceReloadParams): Promise<this> {
    const { rotatingTokenNonce } = params || {};
    const json = await BaseResource._fetch(
      {
        method: 'GET',
        path: `/me/organization_memberships`,
        rotatingTokenNonce,
      },
      { forceUpdateClient: true },
    );
    const currentOrganization = (json?.response as unknown as OrganizationMembershipJSON[]).find(
      orgMem => orgMem.organization.id === this.id,
    );
    return this.fromJSON(currentOrganization?.organization as OrganizationJSON);
  }
}
