import { withLegacyReturn, withLegacySyncReturn } from './legacyReturn';
import { signJwt as _signJwt } from './signJwt';
import { decodeJwt as _decodeJwt, hasValidSignature as _hasValidSignature, verifyJwt as _verifyJwt } from './verifyJwt';

export type { VerifyJwtOptions } from './verifyJwt';
export type { SignJwtOptions } from './signJwt';

// Introduce compatibility layer to avoid more breaking changes
// TODO(dimkl): This (probably be drop in the next major version)

export const verifyJwt = withLegacyReturn(_verifyJwt);
export const decodeJwt = withLegacySyncReturn(_decodeJwt);

export const signJwt = withLegacyReturn(_signJwt);
export const hasValidSignature = withLegacyReturn(_hasValidSignature);
