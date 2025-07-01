import { joinPaths } from '../../util/path';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

type WithMachineTokenSecret<T> = T & { machineTokenSecret?: string | null };

type CreateMachineTokenParams = WithMachineTokenSecret<{
  name: string;
  subject: string;
  claims?: Record<string, any> | null;
  scopes?: string[];
  createdBy?: string | null;
  secondsUntilExpiration?: number | null;
}>;

type UpdateMachineTokenParams = WithMachineTokenSecret<
  {
    m2mTokenId: string;
    revoked?: boolean;
  } & Pick<CreateMachineTokenParams, 'secondsUntilExpiration' | 'claims' | 'scopes'>
>;

type RevokeMachineTokenParams = WithMachineTokenSecret<{
  m2mTokenId: string;
  revocationReason?: string | null;
}>;

export class MachineTokensApi extends AbstractAPI {
  #withMachineTokenSecretHeader(
    options: ClerkBackendApiRequestOptions,
    machineTokenSecret?: string | null,
  ): ClerkBackendApiRequestOptions {
    if (machineTokenSecret) {
      return {
        ...options,
        headerParams: {
          Authorization: `Bearer ${machineTokenSecret}`,
        },
      };
    }
    return options;
  }

  async create(params: CreateMachineTokenParams) {
    const { machineTokenSecret, ...bodyParams } = params;
    return this.request<MachineToken>(
      this.#withMachineTokenSecretHeader(
        {
          method: 'POST',
          path: basePath,
          bodyParams,
        },
        machineTokenSecret,
      ),
    );
  }

  async update(params: UpdateMachineTokenParams) {
    const { m2mTokenId, machineTokenSecret, ...bodyParams } = params;
    this.requireId(m2mTokenId);
    return this.request<MachineToken>(
      this.#withMachineTokenSecretHeader(
        {
          method: 'PATCH',
          path: joinPaths(basePath, m2mTokenId),
          bodyParams,
        },
        machineTokenSecret,
      ),
    );
  }

  async revoke(params: RevokeMachineTokenParams) {
    const { m2mTokenId, machineTokenSecret, ...bodyParams } = params;
    this.requireId(m2mTokenId);
    return this.request<MachineToken>(
      this.#withMachineTokenSecretHeader(
        {
          method: 'POST',
          path: joinPaths(basePath, m2mTokenId, 'revoke'),
          bodyParams,
        },
        machineTokenSecret,
      ),
    );
  }

  async verifySecret(secret: string) {
    return this.request<MachineToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
