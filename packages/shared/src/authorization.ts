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

type CheckOrgAuthorization = (
  params: { role?: OrganizationCustomRoleKey; permission?: OrganizationCustomPermissionKey },
  options: Pick<AuthorizationOptions, 'orgId' | 'orgRole' | 'orgPermissions'>,
) => boolean | null;

type CheckBillingAuthorization = (
  params: { feature?: string; plan?: string },
  options: Pick<AuthorizationOptions, 'plans' | 'features'>,
) => boolean | null;

type CheckReverificationAuthorization = (
  params: {
    reverification?: ReverificationConfig;
  },
  { factorVerificationAge }: AuthorizationOptions,
) => boolean | null;

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

const prefixWithOrg = (value: string) => value.replace(/^(org:)*/, 'org:');

/**
 * Checks if a user has the required Organization-level authorization.
 * Verifies if the user has the specified Role or Permission within their Organization.
 * @returns null, if unable to determine due to missing data or unspecified Role/Permission.
 */
const checkOrgAuthorization: CheckOrgAuthorization = (params, options) => {
  const { orgId, orgRole, orgPermissions } = options;
  if (!params.role && !params.permission) {
    return null;
  }

  if (!orgId || !orgRole || !orgPermissions) {
    return null;
  }

  if (params.permission) {
    return orgPermissions.includes(prefixWithOrg(params.permission));
  }

  if (params.role) {
    return prefixWithOrg(orgRole) === prefixWithOrg(params.role);
  }
  return null;
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

const checkBillingAuthorization: CheckBillingAuthorization = (params, options) => {
  const { features, plans } = options;

  if (params.feature && features) {
    return checkForFeatureOrPlan(features, params.feature);
  }

  if (params.plan && plans) {
    return checkForFeatureOrPlan(plans, params.plan);
  }
  return null;
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
 * Compares the user's factor verification ages against the specified maxAge.
 * Handles different verification levels (first factor, second factor, multi-factor).
 * @returns null, if requirements or verification data are missing.
 */
const checkReverificationAuthorization: CheckReverificationAuthorization = (params, { factorVerificationAge }) => {
  if (!params.reverification || !factorVerificationAge) {
    return null;
  }

  const isValidReverification = validateReverificationConfig(params.reverification);
  if (!isValidReverification) {
    return null;
  }

  const { level, afterMinutes } = isValidReverification();
  const [factor1Age, factor2Age] = factorVerificationAge;

  // -1 indicates the factor group (1fa,2fa) is not enabled
  // -1 for 1fa is not a valid scenario, but we need to make sure we handle it properly
  const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
  const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;

  switch (level) {
    case 'first_factor':
      return isValidFactor1;
    case 'second_factor':
      return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
    case 'multi_factor':
      return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
  }
};

/**
 * Creates a function for comprehensive user authorization checks.
 * Combines organization-level and reverification authentication checks.
 * The returned function authorizes if both checks pass, or if at least one passes
 * when the other is indeterminate. Fails if userId is missing.
 */
const createCheckAuthorization = (options: AuthorizationOptions): CheckAuthorizationWithCustomPermissions => {
  return (params): boolean => {
    if (!options.userId) {
      return false;
    }

    const billingAuthorization = checkBillingAuthorization(params, options);
    const orgAuthorization = checkOrgAuthorization(params, options);
    const reverificationAuthorization = checkReverificationAuthorization(params, options);

    if ([billingAuthorization || orgAuthorization, reverificationAuthorization].some(a => a === null)) {
      return [billingAuthorization || orgAuthorization, reverificationAuthorization].some(a => a === true);
    }

    return [billingAuthorization || orgAuthorization, reverificationAuthorization].every(a => a === true);
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
