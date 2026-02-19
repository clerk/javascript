# M2M JWT Token Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add JWT format support for M2M tokens, mirroring the existing OAuth JWT pattern.

**Architecture:** Extend the machine token detection and verification system to recognize M2M JWTs by their `sub` claim prefix (`mch_`). JWT M2M tokens are verified locally using JWKS, while opaque tokens continue to use BAPI verification.

**Tech Stack:** TypeScript, Vitest, JWT (RS256)

---

### Task 1: Add M2M JWT Test Fixtures

**Files:**

- Modify: `packages/backend/src/fixtures/machine.ts`
- Modify: `packages/backend/src/fixtures/index.ts` (if needed for exports)

**Step 1: Add M2M JWT payload fixture**

In `packages/backend/src/fixtures/machine.ts`, add:

```typescript
// M2M JWT payload for testing
// Uses same timestamps as mockOAuthAccessTokenJwtPayload for consistency
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
```

**Step 2: Add signed M2M JWT fixture**

Check `packages/backend/src/fixtures/index.ts` to understand how `createJwt` works, then add to `machine.ts`:

```typescript
// Import createJwt from fixtures if not already available
// The mockSignedM2MJwt should be created using the same signing keys as OAuth

// Valid M2M JWT token
// Header: {"alg":"RS256","kid":"ins_2GIoQhbUpy0hX7B2cVkuTMinXoD","typ":"JWT"}
// Payload: mockM2MJwtPayload
// Signed with signingJwks, verifiable with mockJwks
export const mockSignedM2MJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2NsZXJrLm0ybS5leGFtcGxlLnRlc3QiLCJzdWIiOiJtY2hfMnZZVnRlc3RURVNUVGVZDFRFU1R0ZXN0VEVTVHRlc3QiLCJhdWQiOlsibWNoXzF4eHh4eCIsIm1jaF8yeHh4eHgiXSwiZXhwIjoxNjY2NjQ4NTUwLCJpYXQiOjE2NjY2NDgyNTAsIm5iZiI6MTY2NjY0ODI0MCwianRpIjoibXRfMnhLYTlCZ3Y3TnhNUkRGeVF3OExwWjNjVG1VMXZIakUiLCJzY29wZXMiOiJtY2hfMXh4eHh4IG1jaF8yeHh4eHgifQ.placeholder';
```

**Note:** The actual signed JWT needs to be generated. Check how `mockSignedOAuthAccessTokenJwt` was created and follow the same pattern. You may need to use `createJwt` from fixtures and sign with the test signing keys.

**Step 3: Export the new fixtures**

Ensure exports at end of `machine.ts`:

```typescript
// Should already export mockSignedOAuthAccessTokenJwt, add M2M exports
```

**Step 4: Commit**

```bash
git add packages/backend/src/fixtures/machine.ts
git commit -m "test(backend): Add M2M JWT test fixtures"
```

---

### Task 2: Add `isM2MJwt()` Function with Tests

**Files:**

- Modify: `packages/backend/src/tokens/machine.ts`
- Modify: `packages/backend/src/tokens/__tests__/machine.test.ts`

**Step 1: Write the failing tests for `isM2MJwt()`**

In `packages/backend/src/tokens/__tests__/machine.test.ts`, add:

```typescript
import { mockM2MJwtPayload, mockSignedM2MJwt } from '../../fixtures/machine';

// Add to imports at top
import {
  // ... existing imports
  isM2MJwt,
} from '../machine';

// Add new describe block
describe('isM2MJwt', () => {
  it('returns true for JWT with sub starting with mch_', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockM2MJwtPayload,
    });
    expect(isM2MJwt(token)).toBe(true);
  });

  it('returns true for signed M2M JWT', () => {
    expect(isM2MJwt(mockSignedM2MJwt)).toBe(true);
  });

  it('returns false for OAuth JWT (different sub prefix)', () => {
    expect(isM2MJwt(mockSignedOAuthAccessTokenJwt)).toBe(false);
  });

  it('returns false for regular JWT without mch_ sub', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: { ...mockM2MJwtPayload, sub: 'user_123' },
    });
    expect(isM2MJwt(token)).toBe(false);
  });

  it('returns false for non-JWT token', () => {
    expect(isM2MJwt('mt_opaque_token')).toBe(false);
    expect(isM2MJwt('not.a.jwt')).toBe(false);
    expect(isM2MJwt('')).toBe(false);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: FAIL with "isM2MJwt is not exported"

**Step 3: Implement `isM2MJwt()`**

In `packages/backend/src/tokens/machine.ts`, add:

```typescript
/**
 * Checks if a token is an M2M JWT token.
 * Validates the JWT format and verifies the payload 'sub' field starts with 'mch_'.
 *
 * @param token - The token string to check
 * @returns true if the token is a valid M2M JWT token
 */
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
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: All `isM2MJwt` tests PASS

**Step 5: Commit**

```bash
git add packages/backend/src/tokens/machine.ts packages/backend/src/tokens/__tests__/machine.test.ts
git commit -m "feat(backend): Add isM2MJwt() function to detect M2M JWT tokens"
```

---

### Task 3: Add `isMachineJwt()` Helper with Tests

**Files:**

- Modify: `packages/backend/src/tokens/machine.ts`
- Modify: `packages/backend/src/tokens/__tests__/machine.test.ts`

**Step 1: Write the failing tests**

In `machine.test.ts`, add:

```typescript
// Add to imports
import {
  // ... existing imports
  isMachineJwt,
} from '../machine';

describe('isMachineJwt', () => {
  it('returns true for OAuth JWT', () => {
    expect(isMachineJwt(mockSignedOAuthAccessTokenJwt)).toBe(true);
  });

  it('returns true for M2M JWT', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockM2MJwtPayload,
    });
    expect(isMachineJwt(token)).toBe(true);
  });

  it('returns false for regular session JWT', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: { sub: 'user_123', iat: 1666648250, exp: 1666648550 },
    });
    expect(isMachineJwt(token)).toBe(false);
  });

  it('returns false for opaque tokens', () => {
    expect(isMachineJwt('mt_opaque_token')).toBe(false);
    expect(isMachineJwt('oat_opaque_token')).toBe(false);
    expect(isMachineJwt('ak_opaque_token')).toBe(false);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: FAIL with "isMachineJwt is not exported"

**Step 3: Implement `isMachineJwt()`**

In `machine.ts`, add:

```typescript
/**
 * Checks if a token is a machine JWT (OAuth JWT or M2M JWT).
 * Useful for rejecting machine JWTs when expecting session tokens.
 *
 * @param token - The token string to check
 * @returns true if the token is an OAuth or M2M JWT
 */
export function isMachineJwt(token: string): boolean {
  return isOAuthJwt(token) || isM2MJwt(token);
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: All `isMachineJwt` tests PASS

**Step 5: Commit**

```bash
git add packages/backend/src/tokens/machine.ts packages/backend/src/tokens/__tests__/machine.test.ts
git commit -m "feat(backend): Add isMachineJwt() helper function"
```

---

### Task 4: Update `isMachineToken()` with Tests

**Files:**

- Modify: `packages/backend/src/tokens/machine.ts`
- Modify: `packages/backend/src/tokens/__tests__/machine.test.ts`

**Step 1: Add test for M2M JWT in `isMachineToken`**

In `machine.test.ts`, find the `describe('isMachineToken')` block and add:

```typescript
it('returns true for M2M JWT with mch_ subject', () => {
  const token = createJwt({
    header: { typ: 'JWT', kid: 'ins_whatever' },
    payload: mockM2MJwtPayload,
  });
  expect(isMachineToken(token)).toBe(true);
});

it('returns true for signed M2M JWT', () => {
  expect(isMachineToken(mockSignedM2MJwt)).toBe(true);
});
```

**Step 2: Run tests to verify they fail**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: FAIL - M2M JWT not recognized as machine token

**Step 3: Update `isMachineToken()`**

In `machine.ts`, update:

```typescript
/**
 * Checks if a token is a machine token by looking at its prefix or if it's an OAuth/M2M JWT.
 *
 * @param token - The token string to check
 * @returns true if the token is a machine token
 */
export function isMachineToken(token: string): boolean {
  return isMachineTokenByPrefix(token) || isOAuthJwt(token) || isM2MJwt(token);
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/backend/src/tokens/machine.ts packages/backend/src/tokens/__tests__/machine.test.ts
git commit -m "feat(backend): Update isMachineToken() to recognize M2M JWTs"
```

---

### Task 5: Update `getMachineTokenType()` with Tests

**Files:**

- Modify: `packages/backend/src/tokens/machine.ts`
- Modify: `packages/backend/src/tokens/__tests__/machine.test.ts`

**Step 1: Add tests for M2M JWT detection**

In `machine.test.ts`, find `describe('getMachineTokenType')` and add:

```typescript
it('returns "m2m_token" for M2M JWT with mch_ subject', () => {
  const token = createJwt({
    header: { typ: 'JWT', kid: 'ins_whatever' },
    payload: mockM2MJwtPayload,
  });
  expect(getMachineTokenType(token)).toBe('m2m_token');
});

it('returns "m2m_token" for signed M2M JWT', () => {
  expect(getMachineTokenType(mockSignedM2MJwt)).toBe('m2m_token');
});
```

**Step 2: Run tests to verify they fail**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: FAIL with "Unknown machine token type"

**Step 3: Update `getMachineTokenType()`**

In `machine.ts`, update:

```typescript
/**
 * Gets the specific type of machine token based on its prefix or JWT claims.
 *
 * @param token - The token string to check
 * @returns The specific MachineTokenType
 * @throws Error if the token doesn't match any known machine token type
 */
export function getMachineTokenType(token: string): MachineTokenType {
  // M2M: prefix OR JWT with mch_ subject
  if (token.startsWith(M2M_TOKEN_PREFIX) || isM2MJwt(token)) {
    return TokenType.M2MToken;
  }

  // OAuth: prefix OR JWT with at+jwt typ
  if (token.startsWith(OAUTH_TOKEN_PREFIX) || isOAuthJwt(token)) {
    return TokenType.OAuthToken;
  }

  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }

  throw new Error('Unknown machine token type');
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --run machine.test.ts
```

Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/backend/src/tokens/machine.ts packages/backend/src/tokens/__tests__/machine.test.ts
git commit -m "feat(backend): Update getMachineTokenType() to return m2m_token for M2M JWTs"
```

---

### Task 6: Add `M2MToken.fromJwtPayload()` with Tests

**Files:**

- Modify: `packages/backend/src/api/resources/M2MToken.ts`
- Create or modify: `packages/backend/src/api/resources/__tests__/M2MToken.test.ts`

**Step 1: Write the failing test**

Create or modify `packages/backend/src/api/resources/__tests__/M2MToken.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { M2MToken } from '../M2MToken';

describe('M2MToken', () => {
  describe('fromJwtPayload', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1666648250 * 1000)); // Same as iat
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('creates M2MToken from JWT payload', () => {
      const payload = {
        iss: 'https://clerk.m2m.example.test',
        sub: 'mch_2vYVtestTESTtestTESTtestTESTtest',
        aud: ['mch_1xxxxx', 'mch_2xxxxx'],
        exp: 1666648550,
        iat: 1666648250,
        nbf: 1666648240,
        jti: 'mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.id).toBe('mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE');
      expect(token.subject).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
      expect(token.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(token.claims).toBeNull();
      expect(token.revoked).toBe(false);
      expect(token.revocationReason).toBeNull();
      expect(token.expired).toBe(false);
      expect(token.expiration).toBe(1666648550);
      expect(token.createdAt).toBe(1666648250);
      expect(token.updatedAt).toBe(1666648250);
    });

    it('parses scopes from space-separated string when aud is missing', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
        scopes: 'scope1 scope2 scope3',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.scopes).toEqual(['scope1', 'scope2', 'scope3']);
    });

    it('returns empty scopes when neither aud nor scopes present', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.scopes).toEqual([]);
    });

    it('marks token as expired when exp is in the past', () => {
      vi.setSystemTime(new Date(1666648600 * 1000)); // After exp

      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.expired).toBe(true);
    });

    it('handles missing jti gracefully', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.id).toBe('');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/backend && pnpm test -- --run M2MToken.test.ts
```

Expected: FAIL with "fromJwtPayload is not a function"

**Step 3: Implement `fromJwtPayload()`**

In `packages/backend/src/api/resources/M2MToken.ts`, add:

```typescript
import type { JwtPayload } from '@clerk/types';

// Add at top of file after imports
type M2MJwtPayload = JwtPayload & {
  jti?: string;
  scopes?: string;
  aud?: string[];
};

// Add inside the M2MToken class
/**
 * Creates an M2MToken from a JWT payload.
 * Maps standard JWT claims to token properties.
 */
static fromJwtPayload(payload: JwtPayload, clockSkewInMs = 5000): M2MToken {
  const m2mPayload = payload as M2MJwtPayload;

  return new M2MToken(
    m2mPayload.jti ?? '',
    payload.sub,
    m2mPayload.aud ?? m2mPayload.scopes?.split(' ') ?? [],
    null,
    false,
    null,
    payload.exp * 1000 <= Date.now() - clockSkewInMs,
    payload.exp,
    payload.iat,
    payload.iat,
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --run M2MToken.test.ts
```

Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/backend/src/api/resources/M2MToken.ts packages/backend/src/api/resources/__tests__/M2MToken.test.ts
git commit -m "feat(backend): Add M2MToken.fromJwtPayload() for JWT verification"
```

---

### Task 7: Add `verifyJwtM2MToken()` and Update `verifyM2MToken()`

**Files:**

- Modify: `packages/backend/src/tokens/verify.ts`
- Modify: `packages/backend/src/tokens/__tests__/verify.test.ts`

**Step 1: Write the failing tests**

In `packages/backend/src/tokens/__tests__/verify.test.ts`, add:

```typescript
// Add imports
import { mockM2MJwtPayload, mockSignedM2MJwt } from '../../fixtures/machine';

// Add helper function (similar to createOAuthJwt)
function createM2MJwt(payload = mockM2MJwtPayload) {
  return createJwt({
    header: { typ: 'JWT', kid: 'ins_2GIoQhbUpy0hX7B2cVkuTMinXoD' },
    payload,
  });
}

// Add new describe block
describe('verifyM2MToken with JWT', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockM2MJwtPayload.iat * 1000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('verifies a valid M2M JWT', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const m2mJwt = createM2MJwt();

    const result = await verifyMachineAuthToken(m2mJwt, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.tokenType).toBe('m2m_token');
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data as M2MToken;
    expect(data.id).toBe('mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE');
    expect(data.subject).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
  });

  it('rejects M2M JWT with alg: none', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const m2mJwt = createJwt({
      header: { typ: 'JWT', alg: 'none', kid: 'ins_2GIoQhbUpy0hX7B2cVkuTMinXoD' },
      payload: mockM2MJwtPayload,
    });

    const result = await verifyMachineAuthToken(m2mJwt, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain('Invalid JWT algorithm');
  });

  it('rejects expired M2M JWT', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const expiredPayload = {
      ...mockM2MJwtPayload,
      exp: mockM2MJwtPayload.iat - 100,
    };

    const m2mJwt = createM2MJwt(expiredPayload);

    const result = await verifyMachineAuthToken(m2mJwt, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain('expired');
  });

  it('handles invalid JWT format', async () => {
    const invalidJwt = 'invalid.m2m.jwt';

    const result = await verifyMachineAuthToken(invalidJwt, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.errors).toBeDefined();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd packages/backend && pnpm test -- --run verify.test.ts
```

Expected: FAIL - M2M JWT not properly verified

**Step 3: Implement `verifyJwtM2MToken()` and update `verifyM2MToken()`**

In `packages/backend/src/tokens/verify.ts`, add:

```typescript
// Add import
import { isJwtFormat, isM2MJwt } from './machine';
// Update M2MToken import to include fromJwtPayload usage

// Add new function (after verifyJwtOAuthToken)
async function verifyJwtM2MToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<MachineTokenReturnType<M2MToken, MachineTokenVerificationError>> {
  let decoded: JwtReturnType<Jwt, TokenVerificationError>;
  try {
    decoded = decodeJwt(token);
  } catch (e) {
    return {
      data: undefined,
      tokenType: TokenType.M2MToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenInvalid,
          message: (e as Error).message,
        }),
      ],
    };
  }

  const { data: decodedResult, errors } = decoded;
  if (errors) {
    return {
      data: undefined,
      tokenType: TokenType.M2MToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenInvalid,
          message: errors[0].message,
        }),
      ],
    };
  }

  const { header } = decodedResult;
  const { kid } = header;
  let key: JsonWebKey;

  try {
    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        data: undefined,
        tokenType: TokenType.M2MToken,
        errors: [
          new MachineTokenVerificationError({
            action: TokenVerificationErrorAction.SetClerkJWTKey,
            message: 'Failed to resolve JWK during verification.',
            code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          }),
        ],
      };
    }

    const { data: payload, errors: verifyErrors } = await verifyJwt(token, {
      ...options,
      key,
    });

    if (verifyErrors) {
      return {
        data: undefined,
        tokenType: TokenType.M2MToken,
        errors: [
          new MachineTokenVerificationError({
            code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
            message: verifyErrors[0].message,
          }),
        ],
      };
    }

    const m2mToken = M2MToken.fromJwtPayload(payload, options.clockSkewInMs);

    return { data: m2mToken, tokenType: TokenType.M2MToken, errors: undefined };
  } catch (error) {
    return {
      tokenType: TokenType.M2MToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          message: (error as Error).message,
        }),
      ],
    };
  }
}

// Update verifyM2MToken function
async function verifyM2MToken(
  token: string,
  options: VerifyTokenOptions & { machineSecretKey?: string },
): Promise<MachineTokenReturnType<M2MToken, MachineTokenVerificationError>> {
  // JWT format: verify locally
  if (isJwtFormat(token)) {
    return verifyJwtM2MToken(token, options);
  }

  // Opaque format: verify via BAPI
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.m2m.verify({ token });
    return { data: verifiedToken, tokenType: TokenType.M2MToken, errors: undefined };
  } catch (err: any) {
    return handleClerkAPIError(TokenType.M2MToken, err, 'Machine token not found');
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --run verify.test.ts
```

Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/backend/src/tokens/verify.ts packages/backend/src/tokens/__tests__/verify.test.ts
git commit -m "feat(backend): Add JWT verification support for M2M tokens"
```

---

### Task 8: Update `request.ts` to Use `isMachineJwt()`

**Files:**

- Modify: `packages/backend/src/tokens/request.ts`
- Modify: `packages/backend/src/tokens/__tests__/request.test.ts` (if exists)

**Step 1: Update import**

In `packages/backend/src/tokens/request.ts`, update the import:

```typescript
// Change from:
import { getMachineTokenType, isMachineToken, isOAuthJwt, isTokenTypeAccepted } from './machine';

// To:
import { getMachineTokenType, isMachineToken, isMachineJwt, isTokenTypeAccepted } from './machine';
```

**Step 2: Update `authenticateRequestWithTokenInHeader()`**

Find the function and update the OAuth JWT check:

```typescript
async function authenticateRequestWithTokenInHeader() {
  const { tokenInHeader } = authenticateContext;

  // Reject machine JWTs (OAuth/M2M) when expecting session tokens.
  // These are valid Clerk-signed JWTs but should not be accepted as session tokens.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (isMachineJwt(tokenInHeader!)) {
    return signedOut({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      reason: AuthErrorReason.TokenTypeMismatch,
      message: '',
    });
  }

  // ... rest of function unchanged
```

**Step 3: Run all tests to ensure no regressions**

```bash
cd packages/backend && pnpm test
```

Expected: All tests PASS

**Step 4: Commit**

```bash
git add packages/backend/src/tokens/request.ts
git commit -m "refactor(backend): Use isMachineJwt() in request authentication"
```

---

### Task 9: Export New Functions and Final Verification

**Files:**

- Modify: `packages/backend/src/tokens/machine.ts` (verify exports)
- Modify: `packages/backend/src/index.ts` (if public exports needed)

**Step 1: Verify all functions are exported from machine.ts**

Ensure `machine.ts` exports:

- `isM2MJwt`
- `isMachineJwt`
- All existing exports

**Step 2: Run full test suite**

```bash
cd packages/backend && pnpm test
```

Expected: All tests PASS

**Step 3: Run linter**

```bash
cd packages/backend && pnpm lint
```

Expected: No errors

**Step 4: Run type check**

```bash
cd packages/backend && pnpm typecheck
```

Expected: No errors

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore(backend): Ensure all M2M JWT functions are properly exported"
```

---

### Task 10: Integration Test (Optional)

**Files:**

- Check: `integration/tests/machine-auth/m2m.test.ts`

**Step 1: Review existing integration tests**

Check if there are existing M2M integration tests that need updating.

**Step 2: If tests exist, add M2M JWT test case**

Follow the existing pattern in the file to add a test for M2M JWT verification.

**Step 3: Run integration tests**

```bash
pnpm test:integration:nextjs
```

**Step 4: Commit if changes made**

```bash
git add integration/
git commit -m "test(integration): Add M2M JWT integration tests"
```

---

## Summary

After completing all tasks, you will have:

1. Test fixtures for M2M JWT tokens
2. `isM2MJwt()` - detects M2M JWTs by `sub` claim prefix
3. `isMachineJwt()` - helper to detect any machine JWT
4. Updated `isMachineToken()` to recognize M2M JWTs
5. Updated `getMachineTokenType()` to return correct type for M2M JWTs
6. `M2MToken.fromJwtPayload()` for creating M2MToken from JWT
7. `verifyJwtM2MToken()` for local JWT verification
8. Updated `verifyM2MToken()` to route JWT vs opaque
9. Updated `request.ts` to reject M2M JWTs as session tokens
10. Full test coverage for all new functionality
