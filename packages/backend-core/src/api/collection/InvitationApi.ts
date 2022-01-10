import { Invitation } from '../resources/Invitation';
import { AbstractApi } from './AbstractApi';

const basePath = '/invitations';

type CreateParams = {
  emailAddress: string;
  redirectUrl?: string;
};

export class InvitationApi extends AbstractApi {
  public async getInvitationList() {
    return this._restClient.makeRequest<Array<Invitation>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async createInvitation(params: CreateParams) {
    return this._restClient.makeRequest<Invitation>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async revokeInvitation(invitationId: string) {
    this.requireId(invitationId);
    return this._restClient.makeRequest<Invitation>({
      method: 'POST',
      path: `${basePath}/${invitationId}/revoke`,
    });
  }
}
