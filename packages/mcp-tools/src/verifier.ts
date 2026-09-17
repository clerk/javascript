import type { VerifyTokenOptions } from '@clerk/backend';
import { MachineTokenVerificationErrorCode } from '@clerk/backend/errors';
import { verifyMachineAuthToken } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import type { AuthInfo, OAuthTokenVerifier } from '@modelcontextprotocol/server';
import { OAuthError, OAuthErrorCode } from '@modelcontextprotocol/server';

export type ClerkOAuthTokenVerifierOptions = Pick<
  VerifyTokenOptions,
  'secretKey' | 'jwtKey' | 'apiUrl' | 'apiVersion' | 'clockSkewInMs' | 'skipJwksCache'
> & {
  /**
   * Refuse tokens that were not issued for this resource.
   */
  resource?: string | URL;
};

type VerifiedMachineToken = NonNullable<Awaited<ReturnType<typeof verifyMachineAuthToken>>['data']>;
type OAuthAccessToken = Extract<VerifiedMachineToken, { clientId: string }>;

// A token that several resource servers accept can be replayed between them, so only a single audience is a binding.
export function boundResource(audience: unknown): URL | undefined {
  const audiences = Array.isArray(audience) ? audience : [audience];
  if (audiences.length !== 1 || typeof audiences[0] !== 'string') {
    return undefined;
  }
  try {
    return new URL(audiences[0]);
  } catch {
    return undefined;
  }
}

function jwtAudience(token: string): unknown {
  try {
    return decodeJwt(token).payload.aud;
  } catch {
    return undefined;
  }
}

function invalidToken(): OAuthError {
  return new OAuthError(OAuthErrorCode.InvalidToken, 'The access token is invalid.');
}

/**
 * Creates an MCP SDK token verifier backed by Clerk. JWT access tokens are verified locally with the cached JWKS,
 * opaque tokens through the Backend API. `AuthInfo.resource` carries the token's audience when it has exactly one.
 */
export function createClerkOAuthTokenVerifier(options: ClerkOAuthTokenVerifierOptions): OAuthTokenVerifier {
  const { resource, ...verifyOptions } = options;
  const expected = resource === undefined ? undefined : new URL(resource).href;

  return {
    async verifyAccessToken(token: string): Promise<AuthInfo> {
      let result: Awaited<ReturnType<typeof verifyMachineAuthToken>>;
      try {
        result = await verifyMachineAuthToken(token, verifyOptions);
      } catch {
        throw invalidToken();
      }

      if (result.errors) {
        const [error] = result.errors;
        if (
          error.code === MachineTokenVerificationErrorCode.InvalidSecretKey ||
          error.code === MachineTokenVerificationErrorCode.UnexpectedError
        ) {
          throw new OAuthError(OAuthErrorCode.ServerError, 'Access token verification failed.');
        }
        throw invalidToken();
      }

      if (result.tokenType !== 'oauth_token') {
        throw invalidToken();
      }

      const accessToken = result.data as OAuthAccessToken;
      if (accessToken.revoked || accessToken.expired || accessToken.expiration === null) {
        throw invalidToken();
      }

      // Newer @clerk/backend versions expose the verified audience, which is the only source for opaque tokens.
      const bound = boundResource('aud' in accessToken ? accessToken.aud : jwtAudience(token));
      if (expected !== undefined && bound?.href !== expected) {
        throw invalidToken();
      }

      return {
        token,
        clientId: accessToken.clientId,
        scopes: accessToken.scopes,
        expiresAt: Math.floor(accessToken.expiration / 1000),
        resource: bound,
        extra: { userId: accessToken.subject, accessTokenId: accessToken.id },
      };
    },
  };
}
