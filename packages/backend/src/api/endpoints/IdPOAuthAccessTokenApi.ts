import { assertOAuthAudienceClaim } from '../../jwt/assertions';
import { joinPaths } from '../../util/path';
import type { IdPOAuthAccessToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/oauth_applications/access_tokens';

export class IdPOAuthAccessTokenApi extends AbstractAPI {
  /**
   * Verifies an OAuth access token with the Clerk Backend API. If an audience is provided, at least one expected audience must match the token's `aud` claim. Without an audience, the SDK does not check the `aud` claim.
   *
   * @param accessToken - The OAuth access token to verify.
   * @param options - Optional verification options. `audience` can be one expected audience or an array of acceptable audiences.
   * @returns The verified `IdPOAuthAccessToken` resource, including its audience when present.
   * @throws `ClerkAPIResponseError` if the Backend API rejects the token or request.
   * @throws `TokenVerificationError` if an expected audience is provided but the token has no `aud` claim or none of its audiences match.
   *
   * @example
   * ### Verify a token for an API
   *
   * ```ts
   * const token = await clerkClient.idPOAuthAccessToken.verify(accessToken, {
   *   audience: 'https://api.example.com',
   * });
   * ```
   */
  async verify(accessToken: string, options: { audience?: string | string[] } = {}): Promise<IdPOAuthAccessToken> {
    const verifiedToken = await this.request<IdPOAuthAccessToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { access_token: accessToken },
    });

    assertOAuthAudienceClaim(verifiedToken.aud, options.audience);
    return verifiedToken;
  }
}
