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

// Helper functions
const isValidMaxAge = (maxAge: any) => typeof maxAge === 'number' && maxAge > 0;
const isValidLevel = (level: any) => ALLOWED_LEVELS.has(level);
const isValidVerificationType = (type: any) => ALLOWED_TYPES.has(type);
const isValidFactorAge = (x: unknown): x is number =>
  typeof x === 'number' && Number.isFinite(x) && (x === -1 || x >= 0);

const prefixWithOrg = (value: string) => value.replace(/^(org:)*/, 'org:');

/**
 * Checks if a user has the required organization-level authorization.
 * If both role and permission are provided, both must match (AND).
 */
const checkOrgAuthorization: CheckOrgAuthorization = (params, options) => {
  const { orgId, orgRole, orgPermissions } = options;
  const roleAsked = params.role !== undefined;
  const permissionAsked = params.permission !== undefined;

  if (!roleAsked && !permissionAsked) {
    return 'skip';
  }

  // Asked with a non-string value (e.g. null cast through `as any`): fail closed
  // rather than letting `prefixWithOrg` throw.
  if (roleAsked && typeof params.role !== 'string') {
    return 'fail';
  }
  if (permissionAsked && typeof params.permission !== 'string') {
    return 'fail';
  }

  if (!orgId) {
    return 'fail';
  }

  if (roleAsked) {
    if (typeof orgRole !== 'string' || !orgRole) {
      return 'fail';
    }
    if (prefixWithOrg(orgRole) !== prefixWithOrg(params.role as string)) {
      return 'fail';
    }
  }

  if (permissionAsked) {
    if (!Array.isArray(orgPermissions)) {
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
  const [scope, _id] = featureOrPlan.split(':');
  const id = _id || scope;

  if (scope === 'org') {
    return orgFeatures.includes(id);
  } else if (scope === 'user') {
    return userFeatures.includes(id);
  } else {
    // Since org scoped features will not exist if there is not an active org, merging is safe.
    return [...orgFeatures, ...userFeatures].includes(id);
  }
};

/**
 * Checks if a user is entitled to the requested feature or plan.
 * If both feature and plan are provided, both must match (AND).
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
    if (typeof features !== 'string' || !features) {
      return 'fail';
    }
    try {
      if (!checkForFeatureOrPlan(features, params.feature as string)) {
        return 'fail';
      }
    } catch {
      return 'fail';
    }
  }

  if (planAsked) {
    if (typeof plans !== 'string' || !plans) {
      return 'fail';
    }
    try {
      if (!checkForFeatureOrPlan(plans, params.plan as string)) {
        return 'fail';
      }
    } catch {
      return 'fail';
    }
  }

  return 'pass';
};

const splitByScope = (fea: string | null | undefined) => {
  const features = fea ? fea.split(',').map(f => f.trim()) : [];

  // TODO: make this more efficient
  return {
    org: features.filter(f => f.split(':')[0].includes('o')).map(f => f.split(':')[1]),
    user: features.filter(f => f.split(':')[0].includes('u')).map(f => f.split(':')[1]),
  };
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
 * Handles different verification levels (first factor, second factor, multi-factor).
 */
const checkReverificationAuthorization: CheckReverificationAuthorization = (params, { factorVerificationAge }) => {
  if (params.reverification === undefined) {
    return 'skip';
  }

  if (!factorVerificationAge) {
    return 'fail';
  }

  // Validate the tuple shape before comparing ages to defend against malformed JWT
  // payloads or TS `as any` escapes.
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
  // If neither factor is enrolled we cannot verify anything; fail closed.
  if (factor1Age === -1 && factor2Age === -1) {
    return 'fail';
  }

  const factor1FreshEnough = factor1Age !== -1 && afterMinutes > factor1Age;
  const factor2FreshEnough = factor2Age !== -1 && afterMinutes > factor2Age;

  switch (level) {
    case 'first_factor':
      return factor1FreshEnough ? 'pass' : 'fail';
    case 'second_factor':
      // Graceful downgrade: prefer second factor; fall back to whichever factor is
      // enrolled when the other is missing.
      if (factor2Age === -1) {
        return factor1FreshEnough ? 'pass' : 'fail';
      }
      if (factor1Age === -1) {
        return factor2FreshEnough ? 'pass' : 'fail';
      }
      return factor2FreshEnough ? 'pass' : 'fail';
    case 'multi_factor':
      // Graceful downgrade: no second factor enrolled falls back to first factor.
      if (factor2Age === -1) {
        return factor1FreshEnough ? 'pass' : 'fail';
      }
      // Second factor exists but first factor is not enrolled - we cannot satisfy
      // the multi-factor requirement.
      if (factor1Age === -1) {
        return 'fail';
      }
      return factor1FreshEnough && factor2FreshEnough ? 'pass' : 'fail';
  }
};

// At least one dimension must have passed, and every non-skip result must be a pass.
// This is an AND across asked dimensions with a fail-closed default: if a helper ever
// returns anything other than 'pass' or 'skip' (a typo, off-type, or future variant),
// it is treated as a denial.
const combine = (results: CheckResult[]): boolean =>
  results.some(r => r === 'pass') && results.every(r => r === 'pass' || r === 'skip');

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
      isLoaded: false,
      isSignedIn: undefined,
      sessionId,
      sessionClaims: undefined,
      userId,
      actor: undefined,
      orgId: undefined,
      orgRole: undefined,
      orgSlug: undefined,
      has: undefined,
      signOut,
      getToken,
    } as const;
  }

  if (sessionId === null && userId === null) {
    return {
      isLoaded: true,
      isSignedIn: false,
      sessionId,
      userId,
      sessionClaims: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: () => false,
      signOut,
      getToken,
    } as const;
  }

  if (treatPendingAsSignedOut && sessionStatus === 'pending') {
    return {
      isLoaded: true,
      isSignedIn: false,
      sessionId: null,
      userId: null,
      sessionClaims: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: () => false,
      signOut,
      getToken,
    } as const;
  }

  if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      sessionClaims,
      userId,
      actor: actor || null,
      orgId,
      orgRole,
      orgSlug: orgSlug || null,
      has,
      signOut,
      getToken,
    } as const;
  }

  if (!!sessionId && !!sessionClaims && !!userId && !orgId) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      sessionClaims,
      userId,
      actor: actor || null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has,
      signOut,
      getToken,
    } as const;
  }
};

export { createCheckAuthorization, resolveAuthState, splitByScope, validateReverificationConfig };
