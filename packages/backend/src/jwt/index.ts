import type { Jwt, JwtPayload } from '@clerk/shared/types';

import { withLegacyReturn, withLegacySyncReturn } from './legacyReturn';
import { signJwt as _signJwt } from './signJwt';
import type { VerifyJwtOptions } from './verifyJwt';
import { decodeJwt as _decodeJwt, hasValidSignature as _hasValidSignature, verifyJwt as _verifyJwt } from './verifyJwt';

export type { VerifyJwtOptions } from './verifyJwt';
export type { SignJwtOptions } from './signJwt';

// Introduce compatibility layer to avoid more breaking changes
// TODO(dimkl): This (probably be drop in the next major version)

// These exports wrap their implementations through `withLegacyReturn`, which produces an
// inferred return type. Without an explicit annotation, `tsc`'s declaration emit resolves
// `Jwt`/`JwtPayload` to their declaration site inside `@clerk/shared`'s bundled (and
// export-blocked) `_chunks/*` output, leaving consumers with an unresolvable module
// specifier. Annotating the public types pins the emitted reference to `@clerk/shared/types`.
export const verifyJwt: (token: string, options: VerifyJwtOptions) => Promise<JwtPayload> =
  withLegacyReturn(_verifyJwt);
export const decodeJwt: (token: string) => Jwt = withLegacySyncReturn(_decodeJwt);

export const signJwt = withLegacyReturn(_signJwt);
export const hasValidSignature: (jwt: Jwt, key: JsonWebKey | string) => Promise<boolean> =
  withLegacyReturn(_hasValidSignature);
