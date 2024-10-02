import type {
  __experimental_ReverificationConfig,
  __experimental_SessionVerificationLevel,
  __experimental_SessionVerificationTypes,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

type TypesToConfig = Record<
  __experimental_SessionVerificationTypes,
  Exclude<__experimental_ReverificationConfig, __experimental_SessionVerificationTypes>
>;
type AuthorizationOptions = {
  userId: string | null | undefined;
  orgId: string | null | undefined;
  orgRole: string | null | undefined;
  orgPermissions: string[] | null | undefined;
  __experimental_factorVerificationAge: [number, number] | null;
};

type CheckOrgAuthorization = (
  params: { role?: OrganizationCustomRoleKey; permission?: OrganizationCustomPermissionKey },
  { orgId, orgRole, orgPermissions }: AuthorizationOptions,
) => boolean | null;

type CheckStepUpAuthorization = (
  params: {
    __experimental_reverification?: __experimental_ReverificationConfig;
  },
  { __experimental_factorVerificationAge }: AuthorizationOptions,
) => boolean | null;

const TYPES_TO_OBJECTS: TypesToConfig = {
  veryStrict: {
    afterMinutes: 10,
    level: 'multiFactor',
  },
  strict: {
    afterMinutes: 10,
    level: 'secondFactor',
  },
  moderate: {
    afterMinutes: 60,
    level: 'secondFactor',
  },
  lax: {
    afterMinutes: 1_440,
    level: 'secondFactor',
  },
};

const ALLOWED_LEVELS = new Set<__experimental_SessionVerificationLevel>(['firstFactor', 'secondFactor', 'multiFactor']);

const ALLOWED_TYPES = new Set<__experimental_SessionVerificationTypes>(['veryStrict', 'strict', 'moderate', 'lax']);

// Helper functions
const isValidMaxAge = (maxAge: any) => typeof maxAge === 'number' && maxAge > 0;
const isValidLevel = (level: any) => ALLOWED_LEVELS.has(level);
const isValidVerificationType = (type: any) => ALLOWED_TYPES.has(type);

/**
 * Checks if a user has the required organization-level authorization.
 * Verifies if the user has the specified role or permission within their organization.
 * @returns null, if unable to determine due to missing data or unspecified role/permission.
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
    return orgPermissions.includes(params.permission);
  }
  if (params.role) {
    return orgRole === params.role;
  }
  return null;
};

const validateReverificationConfig = (config: __experimental_ReverificationConfig | undefined) => {
  const convertConfigToObject = (config: __experimental_ReverificationConfig) => {
    if (typeof config === 'string') {
      return TYPES_TO_OBJECTS[config];
    }
    return config;
  };

  if (typeof config === 'string' && isValidVerificationType(config)) {
    return convertConfigToObject.bind(null, config);
  }

  if (typeof config === 'object' && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes)) {
    return convertConfigToObject.bind(null, config);
  }

  return false;
};

/**
 * Evaluates if the user meets step-up authentication requirements.
 * Compares the user's factor verification ages against the specified maxAge.
 * Handles different verification levels (first factor, second factor, multi-factor).
 * @returns null, if requirements or verification data are missing.
 */
const checkStepUpAuthorization: CheckStepUpAuthorization = (params, { __experimental_factorVerificationAge }) => {
  if (!params.__experimental_reverification || !__experimental_factorVerificationAge) {
    return null;
  }

  const isValidReverification = validateReverificationConfig(params.__experimental_reverification);
  if (!isValidReverification) {
    return null;
  }

  const { level, afterMinutes } = isValidReverification();
  const [factor1Age, factor2Age] = __experimental_factorVerificationAge;

  // -1 indicates the factor group (1fa,2fa) is not enabled
  // -1 for 1fa is not a valid scenario, but we need to make sure we handle it properly
  const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
  const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;

  switch (level) {
    case 'firstFactor':
      return isValidFactor1;
    case 'secondFactor':
      return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
    case 'multiFactor':
      return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
  }
};

/**
 * Creates a function for comprehensive user authorization checks.
 * Combines organization-level and step-up authentication checks.
 * The returned function authorizes if both checks pass, or if at least one passes
 * when the other is indeterminate. Fails if userId is missing.
 */
export const createCheckAuthorization = (options: AuthorizationOptions): CheckAuthorizationWithCustomPermissions => {
  return (params): boolean => {
    if (!options.userId) {
      return false;
    }

    const orgAuthorization = checkOrgAuthorization(params, options);
    const stepUpAuthorization = checkStepUpAuthorization(params, options);

    if ([orgAuthorization, stepUpAuthorization].some(a => a === null)) {
      return [orgAuthorization, stepUpAuthorization].some(a => a === true);
    }

    return [orgAuthorization, stepUpAuthorization].every(a => a === true);
  };
};
