import { joinPaths } from '../../util/path';
import type { MachineToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

type CreateMachineTokenParams = {
  name: string;
  subject: string;
  creationReason?: string | null;
  createdBy?: string | null;
  expiration?: number | null;
};

type UpdateMachineTokenParams = {
  name: string;
  subject: string;
  expiration?: number | null;
};

const basePath = '/m2m_tokens';

export class MachineTokensAPI extends AbstractAPI {
  public async createMachineToken(params: CreateMachineTokenParams) {
    return this.request<MachineToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateMachineToken(tokenId: string, params: UpdateMachineTokenParams) {
    return this.request<MachineToken>({
      method: 'PATCH',
      path: joinPaths(basePath, tokenId),
      bodyParams: params,
    });
  }
}
