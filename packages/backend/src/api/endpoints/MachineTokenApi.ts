import { joinPaths } from '../../util/path';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

type CreateMachineTokenParams = {
  secondsUntilExpiration?: number | null;
  claims?: Record<string, unknown> | null;
};

type RevokeMachineTokenParams = {
  m2mTokenId: string;
  revocationReason?: string | null;
};

type VerifyMachineTokenParams = {
  secret: string;
};

export class MachineTokenApi extends AbstractAPI {
  async create(params?: CreateMachineTokenParams) {
    const { claims = null, secondsUntilExpiration = null } = params || {};

    return this.request<MachineToken>({
      method: 'POST',
      path: basePath,
      bodyParams: {
        secondsUntilExpiration,
        claims,
      },
      options: {
        requireMachineSecretKey: true,
      },
    });
  }

  async revoke(params: RevokeMachineTokenParams) {
    const { m2mTokenId, revocationReason = null } = params;

    this.requireId(m2mTokenId);

    return this.request<MachineToken>({
      method: 'POST',
      path: joinPaths(basePath, m2mTokenId, 'revoke'),
      bodyParams: {
        revocationReason,
      },
    });
  }

  async verifySecret(params: VerifyMachineTokenParams) {
    const { secret } = params;

    return this.request<MachineToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
