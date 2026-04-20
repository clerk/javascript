import type {
  ActClaim,
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  PendingSessionOptions,
  ReverificationConfig,
  SessionStatusClaim,
  SessionVerificationLevel,
  SessionVerificationTypes,
  SignOut,
  UseAuthReturn,
} from './types';

type TypesToConfig = Record<SessionVerificationTypes, Exclude<ReverificationConfig, SessionVerificationTypes>>;
type AuthorizationOptions = {
  userId: string | null | undefined;
  orgId: string | null | undefined;
  orgRole: string | null | undefined;
  orgPermissions: string[] | null | undefined;
  factorVerificationAge: [number, number] | null;
  features: string | null | undefined;
  plans: string | null | undefined;
};

// Internal verdict for each authorization dimension.
// pass  = caller asked, the dimension is satisfied
// fail  = caller asked, the dimension is not satisfied (includes "data missing" - fail closed)
// skip  = caller did not ask in this dimension; it does not contribute to the result
type CheckResult = 'pass' | 'fail' | 'skip';

type CheckOrgAuthorization = (
  params: { role?: OrganizationCustomRoleKey; permission?: OrganizationCustomPermissionKey },
  options: Pick<AuthorizationOptions, 'orgId' | 'orgRole' | 'orgPermissions'>,
) => CheckResult;

type CheckBillingAuthorization = (
  params: { feature?: string; plan?: string },
  options: Pick<AuthorizationOptions, 'plans' | 'features'>,
) => CheckResult;

type CheckReverificationAuthorization = (
  params: {
    reverification?: ReverificationConfig;
  },
  { factorVerificationAge }: AuthorizationOptions,
) => CheckResult;

const TYPES_TO_OBJECTS: TypesToConfig = {
  strict_mfa: {
    afterMinutes: 10,
    level: 'multi_factor',
  },
  strict: {
    afterMinutes: 10,
    level: 'second_factor',
  },
  moderate: {
    afterMinutes: 60,
    level: 'second_factor',
  },
  lax: {
    afterMinutes: 1_440,
    level: 'second_factor',
  },
};

const ALLOWED_LEVELS = new Set<SessionVerificationLevel>(['first_factor', 'second_factor', 'multi_factor']);

const ALLOWED_TYPES = new Set<SessionVerificationTypes>(['strict_mfa', 'strict', 'moderate', 'lax']);

const ORG_SCOPES = new Set(['o', 'org', 'organization']);
const USER_SCOPES = new Set(['u', 'user']);

// Helper functions
const isValidMaxAge = (maxAge: any) => typeof maxAge === 'number' && maxAge > 0;
const isValidLevel = (level: any) => ALLOWED_LEVELS.has(level);
const isValidVerificationType = (type: any) => ALLOWED_TYPES.has(type);
const isValidFactorAge = (x: unknown): x is number =>
  typeof x === 'number' && Number.isFinite(x) && (x === -1 || x >= 0);

const prefixWithOrg = (value: string) => value.replace(/^(org:)*/, 'org:');

/**
 * Checks if a user has the required organization-level authorization.
 * Verifies if the user has the specified role or permission within their organization.
 * If both role and permission are provided, both must match (AND).
 *
 * @returns 'skip' if neither role nor permission was requested; 'fail' if a requested
 *   check cannot be satisfied or the required claim is missing; 'pass' otherwise.
 */
const checkOrgAuthorization: CheckOrgAuthorization = (params, options) => {
  const { orgId, orgRole, orgPermissions } = options;
  const roleAsked = params.role !== undefined;
  const permAsked = params.permission !== undefined;

  if (!roleAsked && !permAsked) {
    return 'skip';
  }

  // Asked with a non-string value (e.g. null cast through `as any`): fail closed
  // rather than letting `prefixWithOrg` throw.
  if (roleAsked && typeof params.role !== 'string') {
    return 'fail';
  }
  if (permAsked && typeof params.permission !== 'string') {
    return 'fail';
  }

  if (!orgId) {
    return 'fail';
  }

  if (roleAsked) {
    if (!orgRole) {
      return 'fail';
    }
    if (prefixWithOrg(orgRole) !== prefixWithOrg(params.role as string)) {
      return 'fail';
    }
  }

  if (permAsked) {
    if (!orgPermissions) {
      return 'fail';
    }
    if (!orgPermissions.includes(prefixWithOrg(params.permission as string))) {
      return 'fail';
    }
  }

  return 'pass';
};

const checkForFeatureOrPlan = (claim: string, featureOrPlan: string) => {
  const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
  const [rawScope, rawId] = featureOrPlan.split(':');
  const hasExplicitScope = rawId !== undefined;
  const scope = rawScope;
  const id = rawId || rawScope;

  if (hasExplicitScope && !ORG_SCOPES.has(scope) && !USER_SCOPES.has(scope)) {
    throw new Error(`Invalid scope: ${scope}`);
  }

  if (hasExplicitScope) {
    if (ORG_SCOPES.has(scope)) {
      return orgFeatures.includes(id);
    }
    if (USER_SCOPES.has(scope)) {
      return userFeatures.includes(id);
    }
  }

  // Since org scoped features will not exist if there is not an active org, merging is safe.
  return [...orgFeatures, ...userFeatures].includes(id);
};

/**
 * Checks if a user is entitled to the requested feature or plan.
 * If both feature and plan are provided, both must match (AND).
 *
 * @returns 'skip' if neither feature nor plan was requested; 'fail' if a requested
 *   check cannot be satisfied or the corresponding claim is missing; 'pass' otherwise.
 */
const checkBillingAuthorization: CheckBillingAuthorization = (params, options) => {
  const { features, plans } = options;
  const featureAsked = params.feature !== undefined;
  const planAsked = params.plan !== undefined;

  if (!featureAsked && !planAsked) {
    return 'skip';
  }

  // Asked with a non-string value: fail closed before handing to checkForFeatureOrPlan.
  if (featureAsked && typeof params.feature !== 'string') {
    return 'fail';
  }
  if (planAsked && typeof params.plan !== 'string') {
    return 'fail';
  }

  if (featureAsked) {
    if (!features) {
      return 'fail';
    }
    if (!checkForFeatureOrPlan(features, params.feature as string)) {
      return 'fail';
    }
  }

  if (planAsked) {
    if (!plans) {
      return 'fail';
    }
    if (!checkForFeatureOrPlan(plans, params.plan as string)) {
      return 'fail';
    }
  }

  return 'pass';
};

const splitByScope = (fea: string | null | undefined) => {
  const org: string[] = [];
  const user: string[] = [];

  if (!fea) {
    return { org, user };
  }

  const parts = fea.split(',');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Invalid claim element (missing colon): ${part}`);
    }
    const scope = part.slice(0, colonIndex);
    const value = part.slice(colonIndex + 1);

    if (scope === 'o') {
      org.push(value);
    } else if (scope === 'u') {
      user.push(value);
    } else if (scope === 'ou' || scope === 'uo') {
      org.push(value);
      user.push(value);
    }
  }

  return { org, user };
};

const validateReverificationConfig = (config: ReverificationConfig | undefined | null) => {
  if (!config) {
    return false;
  }

  const convertConfigToObject = (config: ReverificationConfig) => {
    if (typeof config === 'string') {
      return TYPES_TO_OBJECTS[config];
    }
    return config;
  };

  const isValidStringValue = typeof config === 'string' && isValidVerificationType(config);
  const isValidObjectValue =
    typeof config === 'object' && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);

  if (isValidStringValue || isValidObjectValue) {
    return convertConfigToObject.bind(null, config);
  }

  return false;
};

/**
 * Evaluates if the user meets re-verification authentication requirements.
 * Compares the user's factor verification ages against the specified maxAge.
 * Handles different verification levels (first factor, second factor, multi-factor).
 *
 * @returns 'skip' if reverification was not requested; 'fail' if the requirement cannot
 *   be satisfied or the verification data is missing or malformed; 'pass' otherwise.
 */
const checkReverificationAuthorization: CheckReverificationAuthorization = (params, { factorVerificationAge }) => {
  if (params.reverification === undefined) {
    return 'skip';
  }

  if (!factorVerificationAge) {
    return 'fail';
  }

  // Validate the tuple shape before comparing ages to defend against malformed JWT
  // payloads or TS `as any` escapes. `factor1Age` / `factor2Age` must be numbers
  // representing minutes (or -1 when a factor group is not enabled).
  if (
    !Array.isArray(factorVerificationAge) ||
    factorVerificationAge.length !== 2 ||
    !isValidFactorAge(factorVerificationAge[0]) ||
    !isValidFactorAge(factorVerificationAge[1])
  ) {
    return 'fail';
  }

  const getConfig = validateReverificationConfig(params.reverification);
  if (!getConfig) {
    return 'fail';
  }

  const { level, afterMinutes } = getConfig();
  const [factor1Age, factor2Age] = factorVerificationAge;

  // -1 indicates the factor group (1fa, 2fa) is not enabled.
  // -1 for 1fa is not a valid state; fail closed.
  if (factor1Age === -1) {
    return 'fail';
  }

  const factor1FreshEnough = afterMinutes > factor1Age;

  switch (level) {
    case 'first_factor':
      return factor1FreshEnough ? 'pass' : 'fail';
    case 'second_factor':
      // Existing behavior: when no 2FA is enrolled, fall back to first-factor freshness.
      // A separate product decision tracks whether strict/moderate/lax should fail
      // closed here instead.
      return (factor2Age === -1 ? factor1FreshEnough : afterMinutes > factor2Age) ? 'pass' : 'fail';
    case 'multi_factor':
      // multi_factor (strict_mfa) requires a fresh second factor. If no second factor
      // is enrolled we cannot satisfy the requirement; fail closed.
      return factor2Age !== -1 && factor1FreshEnough && afterMinutes > factor2Age ? 'pass' : 'fail';
  }
};

/**
 * Combines per-dimension results into a single authorization decision.
 *
 * Rules:
 * - `skip` entries are ignored (the caller did not ask about that dimension)
 * - a single `fail` is a hard denial
 * - at least one dimension must have been asked, otherwise deny
 * - all asked dimensions must `pass` (AND)
 */
const combine = (results: CheckResult[]): boolean => {
  let any = false;
  for (const r of results) {
    if (r === 'skip') continue;
    if (r === 'fail') return false;
    any = true;
  }
  return any;
};

/**
 * Creates a function for comprehensive user authorization checks.
 * Combines organization, billing, and reverification checks. The returned function
 * authorizes only when every requested dimension passes; any requested dimension
 * that cannot be satisfied (including missing or malformed session data) denies
 * the request. Fails if `userId` is missing.
 */
const createCheckAuthorization = (options: AuthorizationOptions): CheckAuthorizationWithCustomPermissions => {
  return (params): boolean => {
    if (!options.userId) {
      return false;
    }

    return combine([
      checkOrgAuthorization(params, options),
      checkBillingAuthorization(params, options),
      checkReverificationAuthorization(params, options),
    ]);
  };
};

type AuthStateOptions = {
  authObject: {
    userId?: string | null;
    sessionId?: string | null;
    sessionStatus?: SessionStatusClaim | null;
    sessionClaims?: JwtPayload | null;
    actor?: ActClaim | null;
    orgId?: string | null;
    orgRole?: OrganizationCustomRoleKey | null;
    orgSlug?: string | null;
    orgPermissions?: OrganizationCustomPermissionKey[] | null;
    getToken: GetToken;
    signOut: SignOut;
    has: (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => boolean;
  };
  options: PendingSessionOptions;
};

/**
 * Shared utility function that centralizes auth state resolution logic,
 * preventing duplication across different packages.
 *
 * @internal
 */
const resolveAuthState = ({
  authObject: {
    sessionId,
    sessionStatus,
    userId,
    actor,
    orgId,
    orgRole,
    orgSlug,
    signOut,
    getToken,
    has,
    sessionClaims,
  },
  options: { treatPendingAsSignedOut = true },
}: AuthStateOptions): UseAuthReturn | undefined => {
  if (sessionId === undefined && userId === undefined) {
    return {
      actor: undefined,
      getToken,
      has: () => false,
      isLoaded: false,
      isSignedIn: undefined,
      orgId: undefined,
      orgRole: undefined,
      orgSlug: undefined,
      sessionClaims: undefined,
      sessionId,
      signOut,
      userId,
    } as const;
  }

  if (sessionId === null && userId === null) {
    return {
      actor: null,
      getToken,
      has: () => false,
      isLoaded: true,
      isSignedIn: false,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      sessionClaims: null,
      sessionId,
      signOut,
      userId,
    } as const;
  }

  if (treatPendingAsSignedOut && sessionStatus === 'pending') {
    return {
      actor: null,
      getToken,
      has: () => false,
      isLoaded: true,
      isSignedIn: false,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      sessionClaims: null,
      sessionId: null,
      signOut,
      userId: null,
    } as const;
  }

  if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) {
    return {
      actor: actor || null,
      getToken,
      has,
      isLoaded: true,
      isSignedIn: true,
      orgId,
      orgRole,
      orgSlug: orgSlug || null,
      sessionClaims,
      sessionId,
      signOut,
      userId,
    } as const;
  }

  if (!!sessionId && !!sessionClaims && !!userId && !orgId) {
    return {
      actor: actor || null,
      getToken,
      has,
      isLoaded: true,
      isSignedIn: true,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      sessionClaims,
      sessionId,
      signOut,
      userId,
    } as const;
  }
};

export { createCheckAuthorization, resolveAuthState, splitByScope, validateReverificationConfig };
