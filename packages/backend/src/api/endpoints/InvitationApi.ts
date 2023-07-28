import { joinPaths } from '../../util/path';
import type { Invitation } from '../resources/Invitation';
import { AbstractAPI } from './AbstractApi';

const basePath = '/invitations';

type CreateParams = {
  emailAddress: string;
  redirectUrl?: string;
  publicMetadata?: UserPublicMetadata;
};

type GetInvitationListParams = {
  /**
   * Filters invitations based on their status(accepted, pending, revoked).
   *
   * @example
   * get all revoked invitations
   *
   * import { invitations } from '@clerk/clerk-sdk-node';
   * await invitations.getInvitationList({ status: 'revoked })
   *
   */
  status?: 'accepted' | 'pending' | 'revoked';
};

export class InvitationAPI extends AbstractAPI {
  public async getInvitationList(params: GetInvitationListParams = {}) {
    return this.request<Invitation[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createInvitation(params: CreateParams) {
    return this.request<Invitation>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async revokeInvitation(invitationId: string) {
    this.requireId(invitationId);
    return this.request<Invitation>({
      method: 'POST',
      path: joinPaths(basePath, invitationId, 'revoke'),
    });
  }
}
