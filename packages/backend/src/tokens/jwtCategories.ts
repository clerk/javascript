import { decodeJwt } from '../jwt/verifyJwt';

// Token-category tags in the protected JOSE header, distinguishing JWT classes signed by the
// same instance key. Kept in sync with clerk_go (pkg/jwt/jwt.go).
export const JWT_CATEGORY_SESSION_TOKEN = 'cl_B7d4PD111AAA';
export const JWT_CATEGORY_JWT_TEMPLATE = 'cl_B7d4PD222AAA';
export const JWT_CATEGORY_M2M_TOKEN = 'cl_B7d4PD333AAA';
// Instances with `use_ignore_jwt_cat` stamp this on every class, so it carries no class info
// and must not be discriminated on.
export const JWT_CATEGORY_IGNORE = 'cl_I7d4PD111III';

/**
 * Whether `cat` marks a JWT as something other than a session token. An absent `cat` is
 * non-session: every session token carries one, while OIDC `id_token`s signed by the same
 * instance key do not (AISEC-21). Handshake tokens are minted with the session-token category
 * too, but their verifier tolerates an absent one.
 */
export function isNonSessionJwtCategory(cat?: string): boolean {
  return cat !== JWT_CATEGORY_SESSION_TOKEN && cat !== JWT_CATEGORY_IGNORE;
}

/** Malformed tokens return `false`; signature verification is left to reject them. */
export function hasNonSessionJwtCategory(token: string): boolean {
  const { data, errors } = decodeJwt(token);
  return !errors && isNonSessionJwtCategory(data?.header?.cat);
}
