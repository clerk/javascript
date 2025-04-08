import { joinPaths } from '../../util/path';
import type { M2MToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

type CreateM2MTokenParams = {
  name: string;
  subject: string;
  creationReason?: string | null;
  createdBy?: string | null;
  expiration?: number | null;
};

type UpdateM2MTokenParams = {
  name: string;
  subject: string;
  expiration?: number | null;
};

const basePath = '/m2m_tokens';

export class M2MTokensAPI extends AbstractAPI {
  public async createM2MToken(params: CreateM2MTokenParams) {
    return this.request<M2MToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateM2MToken(tokenId: string, params: UpdateM2MTokenParams) {
    return this.request<M2MToken>({
      method: 'PATCH',
      path: joinPaths(basePath, tokenId),
      bodyParams: params,
    });
  }
}
