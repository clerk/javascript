import { joinPaths } from '../../util/path';
import type { Invitation } from '../resources/Invitation';
import { AbstractAPI } from './AbstractApi';

const basePath = '/invitations';

type CreateParams = {
  emailAddress: string;
  redirectUrl?: string;
  publicMetadata?: Record<string, unknown>;
};

export class InvitationAPI extends AbstractAPI {
  public async getInvitationList() {
    return this.request<Invitation[]>({
      method: 'GET',
      path: basePath,
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
