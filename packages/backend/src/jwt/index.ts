import { withLegacyReturn, withLegacySyncReturn } from './legacyReturn';
import { signJwt as _signJwt } from './signJwt';
import { decodeJwt as _decodeJwt, verifyJwt as _verifyJwt } from './verifyJwt';

export type { VerifyJwtOptions } from './verifyJwt';
export type { SignJwtOptions } from './signJwt';

export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512';

// Introduce compatibility layer to avoid more breaking changes
// TODO(dimkl): This (probably be drop in the next major version)

export const verifyJwt = withLegacyReturn(_verifyJwt);
export const decodeJwt = withLegacySyncReturn(_decodeJwt);

export const signJwt = withLegacyReturn(_signJwt);
