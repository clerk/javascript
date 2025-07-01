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
  /**
   * Attaches the machine token secret as an Authorization header if present.
   */
  #withMachineTokenSecretHeader<T extends WithMachineTokenSecret<unknown>>(
    options: ClerkBackendApiRequestOptions,
    params: T,
  ): ClerkBackendApiRequestOptions {
    if (params.machineTokenSecret) {
      return {
        ...options,
        headerParams: {
          Authorization: `Bearer ${params.machineTokenSecret}`,
        },
      };
    }
    return options;
  }

  async create(params: CreateMachineTokenParams) {
    return this.request<MachineToken>(
      this.#withMachineTokenSecretHeader(
        {
          method: 'POST',
          path: basePath,
          bodyParams: params,
        },
        params,
      ),
    );
  }

  async update(params: UpdateMachineTokenParams) {
    const { m2mTokenId, ...bodyParams } = params;
    this.requireId(m2mTokenId);
    return this.request<MachineToken>(
      this.#withMachineTokenSecretHeader(
        {
          method: 'PATCH',
          path: joinPaths(basePath, m2mTokenId),
          bodyParams,
        },
        params,
      ),
    );
  }

  async revoke(params: RevokeMachineTokenParams) {
    const { m2mTokenId, ...bodyParams } = params;
    this.requireId(m2mTokenId);
    return this.request<MachineToken>(
      this.#withMachineTokenSecretHeader(
        {
          method: 'POST',
          path: joinPaths(basePath, m2mTokenId, 'revoke'),
          bodyParams,
        },
        params,
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
