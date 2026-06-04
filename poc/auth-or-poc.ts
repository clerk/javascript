/* eslint-disable */
/**
 * POC: `auth({ or })` — return-type discrimination on the accessor.
 *
 * Premise (from the design review): the ergonomic we admired in Stack Auth's
 * `getUser({ or })` derives its value from collapsing a NULLABLE return into a
 * GUARANTEED one via the `or` literal. Clerk already made that collapse, but
 * across two functions: `auth()` (nullable) vs `auth.protect()` (guaranteed).
 *
 * So the discrimination belongs on the ACCESSOR, where nullability actually
 * lives, not on `protect` (which already always narrows and so has nothing to
 * discriminate). This file proves that the discrimination:
 *
 *   1. narrows `userId` to non-null when `or` escapes (redirect|throw|notFound),
 *   2. stays nullable for bare `auth()` and `or: 'return-null'` (back-compat),
 *   3. composes with the existing `token` axis in ONE generic signature
 *      (no overload explosion against the 6 overloads protect has today),
 *   4. preserves the unauthenticated-vs-unauthorized split via an object `or`,
 *   5. gives `or: 'throw'` a typed, catchable error (the genuinely new cap),
 *   6. makes `protect` expressible as a thin preset: `auth({ or: 'notFound' })`.
 *
 * Shapes below are minimal mirrors of the real types, with references:
 *   - SignedInAuthObject  -> packages/backend/src/tokens/authObjects.ts:44-62
 *                            packages/shared/src/types/authObject.ts:7-48
 *   - authorization union -> packages/shared/src/types/session.ts:64-101
 *   - current overloads   -> packages/nextjs/src/server/protect.ts:40-87
 *   - failure dispatch     -> packages/nextjs/src/server/protect.ts:121-150
 *
 * Kept self-contained so it type-checks (tsc --noEmit) and runs (tsx) with no
 * monorepo install. The authorization params are flattened here (production
 * uses the discriminated union at session.ts:64-101); that axis is orthogonal
 * to the `or` discrimination and composes unchanged.
 */

// ---------------------------------------------------------------------------
// PART 1 — auth object shapes (minimal mirrors of the real SDK types)
// ---------------------------------------------------------------------------

type AuthzParams = {
  role?: string;
  permission?: string;
  feature?: string;
  plan?: string;
};

interface SignedInAuthObject {
  isAuthenticated: true;
  userId: string; // <- non-null. this is what we want to guarantee at call sites
  sessionId: string;
  orgId: string | undefined;
  orgRole: string | undefined;
  has: (params: AuthzParams) => boolean;
  getToken: () => Promise<string | null>;
  tokenType: 'session_token';
}

interface SignedOutAuthObject {
  isAuthenticated: false;
  userId: null;
  sessionId: null;
  orgId: null;
  orgRole: null;
  has: (params: AuthzParams) => boolean;
  getToken: () => Promise<null>;
  tokenType: 'session_token';
}

/** What bare `auth()` returns today: a nullable union. */
type Auth = SignedInAuthObject | SignedOutAuthObject;

interface AuthenticatedMachineObject {
  isAuthenticated: true;
  id: string; // machine tokens have `id`, not `userId`
  tokenType: 'm2m_token' | 'api_key' | 'oauth_token';
}

interface UnauthenticatedMachineObject {
  isAuthenticated: false;
  id: null;
  tokenType: 'm2m_token' | 'api_key' | 'oauth_token';
}

type TokenType = 'session_token' | 'm2m_token' | 'api_key' | 'oauth_token' | 'any';

// ---------------------------------------------------------------------------
// PART 2 — the proposed `or` vocabulary + return-type discrimination
// ---------------------------------------------------------------------------

/**
 * All-verb vocabulary. No stringly-typed `'404'`: every member says WHAT TO DO,
 * not what HTTP status to emit. The adapter maps each verb to its framework
 * primitive (Next: redirect()/notFound(); a backend: a thrown typed error).
 */
type EscapeOutcome = 'redirect' | 'throw' | 'notFound';
type NullOutcome = 'return-null';
type Outcome = EscapeOutcome | NullOutcome;

/**
 * `or` is either a scalar applied to every gate failure, or an object that
 * splits the two failure conditions. Note `unauthorized` accepts ESCAPES only:
 * the user is signed in, so "return-null" there would hand back a signed-in
 * object that failed the gate, defeating the point (and that is just `auth()`).
 */
type OrOption = EscapeOutcome | NullOutcome | { unauthenticated?: Outcome; unauthorized?: EscapeOutcome };

/** Resolve the effective UNAUTHENTICATED outcome (the only one that affects the return type). */
type UnauthOutcome<O> = O extends EscapeOutcome
  ? O
  : O extends NullOutcome
    ? NullOutcome
    : O extends { unauthenticated: infer U }
      ? U extends Outcome
        ? U
        : NullOutcome
      : NullOutcome; // object w/o `unauthenticated`, or `or` omitted -> non-escaping default

type IsEscape<U> = U extends EscapeOutcome ? true : false;

type AuthenticatedForToken<T extends TokenType> = T extends 'session_token'
  ? SignedInAuthObject
  : T extends 'any'
    ? SignedInAuthObject | AuthenticatedMachineObject
    : AuthenticatedMachineObject;

type NullableForToken<T extends TokenType> = T extends 'session_token'
  ? Auth
  : T extends 'any'
    ? Auth | AuthenticatedMachineObject | UnauthenticatedMachineObject
    : AuthenticatedMachineObject | UnauthenticatedMachineObject;

/**
 * The whole point: return type is narrowed iff the UNAUTHENTICATED branch
 * escapes. Authorization failure never returns, so it does not enter here.
 * One conditional handles the full {or-outcome} x {token} matrix.
 */
type AuthReturn<O, T extends TokenType> =
  IsEscape<UnauthOutcome<O>> extends true ? AuthenticatedForToken<T> : NullableForToken<T>;

// ---------------------------------------------------------------------------
// PART 3 — the `auth()` signature (one generic call sig, not N overloads)
// ---------------------------------------------------------------------------

type AuthOptions<O extends OrOption, T extends TokenType> = AuthzParams & {
  or?: O;
  token?: T;
  unauthenticatedUrl?: string;
  unauthorizedUrl?: string;
};

interface AuthFn {
  // `const` type params keep `or: 'throw'` as the literal 'throw', not `string`.
  <const O extends OrOption = NullOutcome, const T extends TokenType = 'session_token'>(
    options?: AuthOptions<O, T>,
  ): Promise<AuthReturn<O, T>>;
}

// ---------------------------------------------------------------------------
// PART 4 — runtime mock (faithful dispatch; mirrors protect.ts:121-150)
// ---------------------------------------------------------------------------

class RedirectError extends Error {
  constructor(public url: string) {
    super(`redirect -> ${url}`);
    this.name = 'RedirectError';
  }
}
class NotFoundError extends Error {
  constructor(public cond: string) {
    super(`notFound (${cond})`);
    this.name = 'NotFoundError';
  }
}
/** The new capability: a typed, catchable error for `or: 'throw'`. */
class ClerkAuthError extends Error {
  constructor(public cond: 'unauthenticated' | 'unauthorized') {
    super(`unauthorized: ${cond}`);
    this.name = 'ClerkAuthError';
  }
}

type Fixture =
  | { kind: 'session'; authenticated: boolean; userId: string | null; roles: string[] }
  | { kind: 'machine'; authenticated: boolean; tokenType: 'm2m_token' | 'api_key' | 'oauth_token'; id: string | null };

// stands in for the request-scoped auth context the real `auth()` reads
let __current: Fixture = { kind: 'session', authenticated: false, userId: null, roles: [] };

type RuntimeOptions = AuthzParams & {
  or?: OrOption;
  token?: TokenType;
  unauthenticatedUrl?: string;
  unauthorizedUrl?: string;
};

const resolveOutcome = (or: OrOption | undefined, cond: 'unauthenticated' | 'unauthorized'): Outcome => {
  if (or === undefined) return 'return-null'; // bare auth(): never escapes
  if (typeof or === 'string') return or; // scalar applies to both conditions
  return or[cond] ?? 'return-null'; // unspecified branch defaults to non-escaping
};

const doEscape = (
  outcome: EscapeOutcome,
  cond: 'unauthenticated' | 'unauthorized',
  urls: { unauthenticatedUrl?: string; unauthorizedUrl?: string },
): never => {
  switch (outcome) {
    case 'redirect': {
      const url = cond === 'unauthenticated' ? (urls.unauthenticatedUrl ?? '/sign-in') : (urls.unauthorizedUrl ?? '/');
      throw new RedirectError(url);
    }
    case 'notFound':
      throw new NotFoundError(cond);
    case 'throw':
      throw new ClerkAuthError(cond);
  }
};

const pickAuthz = (o: RuntimeOptions): AuthzParams => {
  const out: AuthzParams = {};
  for (const k of ['role', 'permission', 'feature', 'plan'] as const) {
    if (o[k] !== undefined) out[k] = o[k];
  }
  return out;
};

const checkHas = (cur: Fixture, authz: AuthzParams): boolean => {
  if (cur.kind !== 'session') return false;
  if (authz.role) return cur.roles.includes(authz.role);
  return true; // permission/feature/plan not modeled in this POC
};

const buildResult = (cur: Fixture, forceSignedOut: boolean) => {
  if (cur.kind === 'machine' && cur.authenticated && !forceSignedOut) {
    return { isAuthenticated: true, id: cur.id, tokenType: cur.tokenType };
  }
  if (cur.kind === 'session' && cur.authenticated && !forceSignedOut) {
    return {
      isAuthenticated: true,
      userId: cur.userId,
      sessionId: 'sess_1',
      tokenType: 'session_token',
      has: () => true,
    };
  }
  return { isAuthenticated: false, userId: null, sessionId: null, tokenType: 'session_token', has: () => false };
};

const auth = (async (options: RuntimeOptions = {}) => {
  const or = options.or;
  const requestedToken: TokenType = options.token ?? 'session_token';
  const authz = pickAuthz(options);
  const hasAuthz = Object.keys(authz).length > 0;
  const urls = { unauthenticatedUrl: options.unauthenticatedUrl, unauthorizedUrl: options.unauthorizedUrl };
  const cur = __current;

  const tokenMatches =
    requestedToken === 'any' ||
    (requestedToken === 'session_token' && cur.kind === 'session') ||
    (cur.kind === 'machine' && requestedToken === cur.tokenType);

  // not authenticated (or wrong token family) -> unauthenticated branch
  if (!cur.authenticated || !tokenMatches) {
    const outcome = resolveOutcome(or, 'unauthenticated');
    if (outcome !== 'return-null') doEscape(outcome, 'unauthenticated', urls);
    return buildResult(cur, true);
  }

  // authenticated -> authorization gate (session tokens only, in this POC)
  if (hasAuthz && cur.kind === 'session') {
    if (!checkHas(cur, authz)) {
      const outcome = resolveOutcome(or, 'unauthorized');
      if (outcome !== 'return-null') doEscape(outcome, 'unauthorized', urls);
      // 'return-null' on unauthorized: ungated, fall through (caller handles via has())
    }
  }

  return buildResult(cur, false);
}) as unknown as AuthFn;

/** `protect` is now just a preset: escape to notFound by default. */
const protect = ((params: AuthzParams & { unauthenticatedUrl?: string; unauthorizedUrl?: string } = {}) =>
  auth({ ...params, or: 'notFound' })) as {
  (params?: AuthzParams & { unauthenticatedUrl?: string; unauthorizedUrl?: string }): Promise<SignedInAuthObject>;
};

// ---------------------------------------------------------------------------
// PART 5 — compile-time proofs (the real deliverable; checked by tsc --noEmit)
// ---------------------------------------------------------------------------

type Equal<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _typeProofs() {
  // (1) bare auth(): nullable. Headline: it is EXACTLY the nullable union, so
  // the existing contract is unchanged (back-compat) when `or` is omitted.
  const a = await auth();
  type _ExactBare = Assert<Equal<typeof a, Auth>>;
  // @ts-expect-error userId may be null without an escaping `or`
  const _a: string = a.userId;

  // (2) escaping outcomes narrow to a guaranteed signed-in user
  const b1 = await auth({ or: 'throw' });
  const _b1: string = b1.userId; // ok
  const b2 = await auth({ or: 'redirect' });
  const _b2: string = b2.userId; // ok
  const b3 = await auth({ or: 'notFound' });
  const _b3: string = b3.userId; // ok

  // (3) explicit return-null stays nullable
  const c = await auth({ or: 'return-null' });
  // @ts-expect-error nullable on purpose
  const _c: string = c.userId;

  // (4) authorization params do not change the (auth-driven) return type
  const d = await auth({ role: 'admin', or: 'notFound' });
  const _d: string = d.userId; // ok

  // (5) object `or`: unauthenticated escape -> narrowed
  const e = await auth({ or: { unauthenticated: 'redirect', unauthorized: 'notFound' } });
  const _e: string = e.userId; // ok

  // (6) object `or`: unauthenticated omitted -> defaults to non-escaping -> nullable
  const f = await auth({ or: { unauthorized: 'notFound' } });
  // @ts-expect-error only the unauthorized branch escapes; anon still returns null
  const _f: string = f.userId;

  // (7) token axis composes with `or` in the same call
  const g = await auth({ token: 'm2m_token', or: 'throw' });
  const _g: string = g.id; // machine object
  // @ts-expect-error machine tokens have no userId
  const _g2 = g.userId;

  // (8) unauthorized cannot be 'return-null' (would defeat the gate)
  // @ts-expect-error 'return-null' is not an EscapeOutcome
  await auth({ or: { unauthorized: 'return-null' } });

  // (9) protect() is a preset that always guarantees signed-in
  const p = await protect();
  const _p: string = p.userId; // ok

  void [_a, _b1, _b2, _b3, _c, _d, _e, _f, _g, _g2, _p];
}

// ---------------------------------------------------------------------------
// PART 6 — runtime scenarios (self-verifying; run with tsx)
// ---------------------------------------------------------------------------

const SIGNED_OUT: Fixture = { kind: 'session', authenticated: false, userId: null, roles: [] };
const MEMBER: Fixture = { kind: 'session', authenticated: true, userId: 'user_member', roles: ['member'] };
const ADMIN: Fixture = { kind: 'session', authenticated: true, userId: 'user_admin', roles: ['admin'] };
const M2M: Fixture = { kind: 'machine', authenticated: true, tokenType: 'm2m_token', id: 'mch_1' };

const results: boolean[] = [];

const summarize = (r: any): string => {
  if (r && typeof r.userId === 'string') return `signed-in(${r.userId})`;
  if (r && r.userId === null) return `signed-out`;
  if (r && typeof r.id === 'string') return `machine(${r.id})`;
  return 'unknown';
};

const check = async (name: string, current: Fixture, run: () => Promise<unknown>, expected: string) => {
  __current = current;
  let actual: string;
  try {
    actual = `return:${summarize(await run())}`;
  } catch (err) {
    if (err instanceof RedirectError) actual = `Redirect:${err.url}`;
    else if (err instanceof NotFoundError) actual = `NotFound`;
    else if (err instanceof ClerkAuthError) actual = `Throw`;
    else actual = `Error:${(err as Error).message}`;
  }
  const ok = actual === expected;
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) console.log(`        expected ${expected} | actual ${actual}`);
};

async function main() {
  console.log('\n=== auth({ or }) drives both the failure mode and the return type ===\n');
  await check('auth() — signed out', SIGNED_OUT, () => auth(), 'return:signed-out');
  await check('auth() — signed in', MEMBER, () => auth(), 'return:signed-in(user_member)');
  await check("auth({ or: 'throw' }) — signed out", SIGNED_OUT, () => auth({ or: 'throw' }), 'Throw');
  await check(
    "auth({ or: 'throw' }) — signed in",
    MEMBER,
    () => auth({ or: 'throw' }),
    'return:signed-in(user_member)',
  );
  await check(
    "auth({ or: 'redirect', unauthenticatedUrl }) — signed out",
    SIGNED_OUT,
    () => auth({ or: 'redirect', unauthenticatedUrl: '/sign-in' }),
    'Redirect:/sign-in',
  );
  await check(
    "auth({ or: 'return-null' }) — signed out",
    SIGNED_OUT,
    () => auth({ or: 'return-null' }),
    'return:signed-out',
  );
  await check(
    "auth({ role:'admin', or:'notFound' }) — member",
    MEMBER,
    () => auth({ role: 'admin', or: 'notFound' }),
    'NotFound',
  );
  await check(
    "auth({ role:'admin', or:'notFound' }) — admin",
    ADMIN,
    () => auth({ role: 'admin', or: 'notFound' }),
    'return:signed-in(user_admin)',
  );

  console.log('\n=== split outcomes: redirect anon to sign-in, but 404 the signed-in-non-admin ===\n');
  const split = { unauthenticated: 'redirect', unauthorized: 'notFound' } as const;
  await check('  signed out -> redirect', SIGNED_OUT, () => auth({ role: 'admin', or: split }), 'Redirect:/sign-in');
  await check('  member     -> notFound', MEMBER, () => auth({ role: 'admin', or: split }), 'NotFound');
  await check(
    '  admin      -> passes',
    ADMIN,
    () => auth({ role: 'admin', or: split }),
    'return:signed-in(user_admin)',
  );

  console.log('\n=== token axis composes with or ===\n');
  await check(
    "auth({ token:'m2m_token', or:'throw' }) — m2m",
    M2M,
    () => auth({ token: 'm2m_token', or: 'throw' }),
    'return:machine(mch_1)',
  );

  console.log('\n=== protect() === auth({ or: notFound }) ===\n');
  await check('protect() — signed out', SIGNED_OUT, () => protect(), 'NotFound');
  await check('protect() — signed in', MEMBER, () => protect(), 'return:signed-in(user_member)');
  await check("protect({ role:'admin' }) — member", MEMBER, () => protect({ role: 'admin' }), 'NotFound');

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} runtime scenarios passed.\n`);
  if (passed !== results.length) process.exitCode = 1;
}

void main();
