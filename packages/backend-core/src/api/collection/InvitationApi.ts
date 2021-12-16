import { AbstractApi } from './AbstractApi';
import { Invitation } from '../resources/Invitation';

const basePath = '/invitations';

type CreateParams = {
  emailAddress: string;
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
    return this._restClient.makeRequest<Invitation>({
      method: 'POST',
      path: `${basePath}/${invitationId}/revoke`,
    });
  }
}
