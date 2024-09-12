import type {
  __experimental_SessionVerificationLevel,
  __experimental_SessionVerificationMaxAge,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

type MaxAgeMap = Record<__experimental_SessionVerificationMaxAge, number>;
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
    __experimental_assurance?: {
      level: __experimental_SessionVerificationLevel;
      maxAge: __experimental_SessionVerificationMaxAge;
    };
  },
  { __experimental_factorVerificationAge }: AuthorizationOptions,
) => boolean | null;

const MAX_AGE_TO_MINUTES: MaxAgeMap = {
  'A1.10min': 10,
  'A2.1hr': 60,
  'A3.4hr': 240, //4 * 60
  'A4.1day': 1440, //24 * 60,
  'A5.1wk': 10080, //7 * 24 * 60,
};

const ALLOWED_MAX_AGES = new Set<__experimental_SessionVerificationMaxAge>(
  Object.keys(MAX_AGE_TO_MINUTES) as __experimental_SessionVerificationMaxAge[],
);
const ALLOWED_LEVELS = new Set<__experimental_SessionVerificationLevel>([
  'L1.firstFactor',
  'L2.secondFactor',
  'L3.multiFactor',
]);

// Helper functions
const isValidMaxAge = (maxAge: __experimental_SessionVerificationMaxAge) => ALLOWED_MAX_AGES.has(maxAge);
const isValidLevel = (level: __experimental_SessionVerificationLevel) => ALLOWED_LEVELS.has(level);

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

/**
 * Evaluates if the user meets step-up authentication requirements.
 * Compares the user's factor verification ages against the specified maxAge.
 * Handles different verification levels (first factor, second factor, multi-factor).
 * @returns null, if requirements or verification data are missing.
 */
const checkStepUpAuthorization: CheckStepUpAuthorization = (params, { __experimental_factorVerificationAge }) => {
  if (!params.__experimental_assurance || !__experimental_factorVerificationAge) {
    return null;
  }
  const { level, maxAge } = params.__experimental_assurance;

  if (!isValidLevel(level) || !isValidMaxAge(maxAge)) {
    return null;
  }

  const [factor1Age, factor2Age] = __experimental_factorVerificationAge;
  const maxAgeInMinutes = MAX_AGE_TO_MINUTES[maxAge];

  // -1 indicates the factor group (1fa,2fa) is not enabled
  // -1 for 1fa is not a valid scenario, but we need to make sure we handle it properly
  const isValidFactor1 = factor1Age !== -1 ? maxAgeInMinutes > factor1Age : null;
  const isValidFactor2 = factor2Age !== -1 ? maxAgeInMinutes > factor2Age : null;

  switch (level) {
    case 'L1.firstFactor':
      return isValidFactor1;
    case 'L2.secondFactor':
      return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
    case 'L3.multiFactor':
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
