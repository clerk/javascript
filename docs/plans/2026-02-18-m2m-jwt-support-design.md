# M2M JWT Token Support Design

## Overview

Add JWT format support for M2M (machine-to-machine) tokens in the JavaScript SDK. This mirrors the existing OAuth JWT support pattern and aligns with backend changes in clerk_go (#16849) and cloudflare-workers (#1579).

## Background

- **Current state**: M2M tokens only support opaque format (`mt_` prefix), verified via BAPI
- **OAuth pattern**: Supports both opaque (`oat_` prefix) and JWT format (detected by `typ: at+jwt` header)
- **New M2M JWT format**: Identified by `sub` claim starting with `mch_` (machine ID)

## Design Decisions

### Detection Strategy

M2M JWTs are identified by checking the `sub` claim prefix (`mch_`), unlike OAuth JWTs which use the header `typ` field. This follows the pattern established by the backend implementation.

**Detection order in `getMachineTokenType()`** (optimized for performance):

1. `mt_` prefix OR `isM2MJwt()` → M2MToken (grouped together)
2. `oat_` prefix OR `isOAuthJwt()` → OAuthToken (grouped together)
3. `ak_` prefix → ApiKey

Prefix checks run first (fast string comparison), JWT decode only as fallback.

### Verification Flow

JWT format M2M tokens are verified locally using JWKS (same as session tokens and OAuth JWTs). Opaque tokens continue to verify via BAPI.

## Implementation

### 1. Detection Logic (`packages/backend/src/tokens/machine.ts`)

**New functions:**

```typescript
export function isM2MJwt(token: string): boolean {
  if (!isJwtFormat(token)) {
    return false;
  }
  try {
    const { data, errors } = decodeJwt(token);
    return !errors && !!data && typeof data.payload.sub === 'string' && data.payload.sub.startsWith('mch_');
  } catch {
    return false;
  }
}

export function isMachineJwt(token: string): boolean {
  return isOAuthJwt(token) || isM2MJwt(token);
}
```

**Updated functions:**

```typescript
export function isMachineToken(token: string): boolean {
  return isMachineTokenByPrefix(token) || isOAuthJwt(token) || isM2MJwt(token);
}

export function getMachineTokenType(token: string): MachineTokenType {
  if (token.startsWith(M2M_TOKEN_PREFIX) || isM2MJwt(token)) {
    return TokenType.M2MToken;
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX) || isOAuthJwt(token)) {
    return TokenType.OAuthToken;
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }
  throw new Error('Unknown machine token type');
}
```

### 2. M2MToken Resource (`packages/backend/src/api/resources/M2MToken.ts`)

**Add `fromJwtPayload()` static method:**

```typescript
type M2MJwtPayload = JwtPayload & {
  jti?: string;
  scopes?: string;
  aud?: string[];
};

static fromJwtPayload(payload: JwtPayload, clockSkewInMs = 5000): M2MToken {
  const m2mPayload = payload as M2MJwtPayload;

  return new M2MToken(
    m2mPayload.jti ?? '',
    payload.sub,
    m2mPayload.aud ?? m2mPayload.scopes?.split(' ') ?? [],
    null,  // claims - not extracted from JWT
    false, // revoked (JWT tokens can't be revoked)
    null,  // revocationReason
    payload.exp * 1000 <= Date.now() - clockSkewInMs,
    payload.exp,
    payload.iat,
    payload.iat,
  );
}
```

### 3. Verification Logic (`packages/backend/src/tokens/verify.ts`)

**New `verifyJwtM2MToken()` function** (mirrors `verifyJwtOAuthToken()`):

- Decode JWT
- Load JWK from PEM or remote
- Verify signature
- Return `M2MToken.fromJwtPayload()`

**Updated `verifyM2MToken()`:**

- If `isJwtFormat(token)` → call `verifyJwtM2MToken()`
- Else → verify via BAPI (existing behavior)

### 4. Request Handling (`packages/backend/src/tokens/request.ts`)

**Update `authenticateRequestWithTokenInHeader()`:**

```typescript
// Reject machine JWTs (OAuth/M2M) when expecting session tokens.
if (isMachineJwt(tokenInHeader!)) {
  return signedOut({
    tokenType: TokenType.SessionToken,
    authenticateContext,
    reason: AuthErrorReason.TokenTypeMismatch,
    message: '',
  });
}
```

### 5. Test Fixtures (`packages/backend/src/fixtures/machine.ts`)

**New M2M JWT fixtures:**

```typescript
export const mockM2MJwtPayload = {
  iss: 'https://clerk.m2m.example.test',
  sub: 'mch_2vYVtestTESTtestTESTtestTESTtest',
  aud: ['mch_1xxxxx', 'mch_2xxxxx'],
  exp: 1666648550,
  iat: 1666648250,
  nbf: 1666648240,
  jti: 'mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE',
  scopes: 'mch_1xxxxx mch_2xxxxx',
};

export const mockSignedM2MJwt = '...'; // Generated and signed with signingJwks
```

## Files to Modify

1. `packages/backend/src/tokens/machine.ts` - Add `isM2MJwt()`, `isMachineJwt()`, update detection functions
2. `packages/backend/src/api/resources/M2MToken.ts` - Add `fromJwtPayload()` method
3. `packages/backend/src/tokens/verify.ts` - Add `verifyJwtM2MToken()`, update `verifyM2MToken()`
4. `packages/backend/src/tokens/request.ts` - Update to use `isMachineJwt()`
5. `packages/backend/src/fixtures/machine.ts` - Add M2M JWT test fixtures
6. `packages/backend/src/tokens/__tests__/machine.test.ts` - Add unit tests for new functions
7. `packages/backend/src/tokens/__tests__/verify.test.ts` - Add M2M JWT verification tests

## Testing Plan

### Unit Tests (`machine.test.ts`)

- `isM2MJwt()`: true for JWT with `sub` starting with `mch_`, false for OAuth JWT/regular JWT/non-JWT
- `isMachineJwt()`: true for both OAuth and M2M JWTs
- `isMachineToken()`: true for M2M JWT
- `getMachineTokenType()`: returns `m2m_token` for M2M JWT

### Unit Tests (`verify.test.ts`)

- `verifyMachineAuthToken()` with valid M2M JWT
- M2M JWT with invalid signature → error
- M2M JWT expired → error
- M2M JWT with `alg: none` → rejected

### Unit Tests (`M2MToken.test.ts`)

- `M2MToken.fromJwtPayload()` correctly maps JWT claims

## Future Work

- **USER-4713**: Backend verification endpoint for M2M JWT tokens. Once implemented, may require updates to align with BAPI response format.

## Related PRs

- clerk_go #16849 - Internal endpoint to fetch instance's primary domain (for JWT `iss` claim)
- cloudflare-workers #1579 - M2M token creation with JWT format support
