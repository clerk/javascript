import { joinPaths } from '../../util/path';
import { Invitation } from '../resources/Invitation';
import { AbstractAPI } from './AbstractApi';

const basePath = '/invitations';

type CreateParams = {
  emailAddress: string;
  redirectUrl?: string;
  publicMetadata?: Record<string, unknown>;
};

export class InvitationAPI extends AbstractAPI {
  public async getInvitationList() {
    return this.APIClient.request<Array<Invitation>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async createInvitation(params: CreateParams) {
    return this.APIClient.request<Invitation>({
      method: 'POST',
      path: basePath,
      bodyParams: {
        ...params,
        publicMetadata: JSON.stringify(params.publicMetadata),
      },
    });
  }

  public async revokeInvitation(invitationId: string) {
    this.requireId(invitationId);
    return this.APIClient.request<Invitation>({
      method: 'POST',
      path: joinPaths(basePath, invitationId, 'revoke'),
    });
  }
}
