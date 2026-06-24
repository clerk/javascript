import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { MachineTokenVerificationError, MachineTokenVerificationErrorCode } from '../../errors';
import { decodeJwt } from '../../jwt/verifyJwt';
import type { JwtMachineVerifyOptions } from '../../jwt/verifyMachineJwt';
import { verifyM2MJwt } from '../../jwt/verifyMachineJwt';
import { isM2MJwt } from '../../tokens/machine';
import { joinPaths } from '../../util/path';
import type { ClerkBackendApiRequestOptions, RequestFunction } from '../request';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { M2MToken } from '../resources/M2MToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

/** @inline */
export type M2MTokenFormat = 'opaque' | 'jwt';

/** @generateWithEmptyComment */
export type GetM2MTokenListParams = ClerkPaginationRequest<{
  /** The custom machine secret key for authentication. If not provided, the SDK will use the value from the environment variables. */
  machineSecretKey?: string;
  /** The machine ID to query M2M tokens by. */
  subject: string;
  /** Whether to include revoked M2M tokens. Defaults to `false`. */
  revoked?: boolean;
  /** Whether to include expired M2M tokens. Defaults to `false`. */
  expired?: boolean;
}>;

/** @generateWithEmptyComment */
export type CreateM2MTokenParams = {
  /** The custom machine secret key for authentication. If not provided, the SDK will use the value from the environment variables. */
  machineSecretKey?: string;
  /** The number of seconds until the token expires. Defaults to `null`, meaning the token does not expire. */
  secondsUntilExpiration?: number | null;
  /** Custom claims to include in the M2M token payload. */
  claims?: Record<string, unknown> | null;
  /**
   * Enables server-side token reuse for opaque tokens. Only applies to opaque tokens (`token_format: 'opaque'`). JWT tokens (`token_format: 'jwt'`) are stateless and are never deduplicated. When set, if a non-revoked, non-expired M2M token already exists for this machine with identical `claims` and `scopes` and at least this many seconds of remaining lifetime, that existing token is returned and no new token is minted.
   *
   * Use this when caching tokens in application memory across requests is impractical — for example, in serverless functions, short-lived job workers, or autoscaling containers that churn faster than the token TTL. Pooling at the server collapses many redundant create calls into reuse of a single live token, which is the recommended pattern for high-volume M2M traffic.
   *
   * Must be strictly less than the effective token lifetime — that is, `seconds_until_expiration` when provided, or the machine's default TTL otherwise. A value greater than or equal to the lifetime is rejected with a `400` error, since no freshly-minted token would ever satisfy the requirement.
   */
  minRemainingTtlSeconds?: number;
  /**
   * The format of the M2M token to create. Defaults to `'opaque'`. Set to `'jwt'` to create a [JSON Web Token](/docs/guides/how-clerk-works/tokens-and-signatures#json-web-tokens-jwts) that can be verified locally without a network request. For a detailed comparison of the two formats, see [Token formats](/docs/guides/development/machine-auth/token-formats).
   */
  tokenFormat?: M2MTokenFormat;
};

/** @generateWithEmptyComment */
export type RevokeM2MTokenParams = {
  /** The custom machine secret key for authentication. If not provided, the SDK will use the value from the environment variables. */
  machineSecretKey?: string;
  /** The ID of the M2M token to revoke. */
  m2mTokenId: string;
  /** The reason for revoking the M2M token. Useful for your records. */
  revocationReason?: string | null;
};

/** @generateWithEmptyComment */
export type VerifyM2MTokenParams = {
  /** The custom machine secret key for authentication. If not provided, the SDK will use the value from the environment variables. */
  machineSecretKey?: string;
  /** The M2M token to verify. */
  token: string;
};

/** @generateWithEmptyComment */
export class M2MTokenApi extends AbstractAPI {
  #verifyOptions: JwtMachineVerifyOptions;

  /**
   * @param verifyOptions - JWT verification options (secretKey, apiUrl, etc.).
   * Passed explicitly because BuildRequestOptions are captured inside the buildRequest closure
   * and are not accessible from the RequestFunction itself.
   */
  constructor(request: RequestFunction, verifyOptions: JwtMachineVerifyOptions = {}) {
    super(request);
    this.#verifyOptions = verifyOptions;
  }

  #createRequestOptions(options: ClerkBackendApiRequestOptions, machineSecretKey?: string) {
    if (machineSecretKey) {
      return {
        ...options,
        headerParams: {
          ...options.headerParams,
          Authorization: `Bearer ${machineSecretKey}`,
        },
      };
    }

    return options;
  }

  /**
   * Gets a list of M2M tokens for the given machine. This endpoint can be authenticated by either a Machine Secret Key or by a Clerk [Secret Key](!secret-key).
   * - When fetching M2M tokens with a Machine Secret Key, only tokens associated with the authenticated machine can be retrieved.
   * - When fetching M2M tokens with a Clerk Secret Key, tokens for any machine in the instance can be retrieved.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) objects and a `totalCount` property containing the total number of M2M tokens for the machine.
   */
  async list(queryParams: GetM2MTokenListParams) {
    const { machineSecretKey, ...params } = queryParams;

    const requestOptions = this.#createRequestOptions(
      {
        method: 'GET',
        path: basePath,
        queryParams: params,
      },
      machineSecretKey,
    );

    return this.request<PaginatedResourceResponse<M2MToken[]>>(requestOptions);
  }

  /**
   * Creates a new [M2M token](https://clerk.com/docs/guides/development/machine-auth/m2m-tokens) for the given machine. Must be authenticated by a Machine Secret Key.
   * @returns The created [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) object.
   */
  async createToken(params?: CreateM2MTokenParams) {
    const {
      claims = null,
      machineSecretKey,
      minRemainingTtlSeconds,
      secondsUntilExpiration = null,
      tokenFormat = 'opaque',
    } = params || {};

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: basePath,
        bodyParams: {
          secondsUntilExpiration,
          claims,
          minRemainingTtlSeconds,
          tokenFormat,
        },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }

  /**
   * Revokes an [M2M token](https://clerk.com/docs/guides/development/machine-auth/m2m-tokens). This endpoint can be authenticated by either a Machine Secret Key or by a Clerk [Secret Key](!secret-key).
   * - When revoking M2M tokens with a Machine Secret Key, the token will be revoked using the machine secret key.
   * - When revoking M2M tokens with a Clerk Secret Key, the token will be revoked using the instance secret key.
   * @returns The revoked [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) object.
   */
  async revokeToken(params: RevokeM2MTokenParams) {
    const { m2mTokenId, revocationReason = null, machineSecretKey } = params;

    this.requireId(m2mTokenId);

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: joinPaths(basePath, m2mTokenId, 'revoke'),
        bodyParams: {
          revocationReason,
        },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }

  async #verifyJwtFormat(token: string): Promise<M2MToken> {
    let decoded;
    try {
      const { data, errors } = decodeJwt(token);
      if (errors) {
        throw errors[0];
      }
      decoded = data;
    } catch (e) {
      throw new MachineTokenVerificationError({
        code: MachineTokenVerificationErrorCode.TokenInvalid,
        message: (e as Error).message,
      });
    }

    const result = await verifyM2MJwt(token, decoded, this.#verifyOptions);
    if (result.errors) {
      throw result.errors[0];
    }
    return result.data;
  }

  /**
   * Verifies a [M2M token](https://clerk.com/docs/guides/development/machine-auth/m2m-tokens). Must be authenticated by a Machine Secret Key.
   * @returns The verified [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) object.
   */
  async verify(params: VerifyM2MTokenParams) {
    const { token, machineSecretKey } = params;

    if (isM2MJwt(token)) {
      return this.#verifyJwtFormat(token);
    }

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: joinPaths(basePath, 'verify'),
        bodyParams: { token },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }
}
