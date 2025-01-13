import type { MachineToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

interface MachineTokensClaims {
  [k: string]: unknown;
}

type CreateMachineTokensParams = {
  machineId: string;
  claims?: MachineTokensClaims;
  expiresInSeconds?: number;
  allowedClockSkew?: number;
};

const basePath = '/machine_tokens';
export class MachineTokensAPI extends AbstractAPI {
  public async create(params: CreateMachineTokensParams) {
    return this.request<MachineToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
