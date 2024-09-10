import type { __experimental_SessionVerificationMaxAge, CheckAuthorizationWithCustomPermissions } from '@clerk/types';

const maxAgeToMinutes: { [key in __experimental_SessionVerificationMaxAge]: number } = {
  'A1.10min': 10,
  'A2.1hr': 60,
  'A3.4hr': 240, //4 * 60
  'A4.1day': 1440, //24 * 60,
  'A5.1wk': 10080, //7 * 24 * 60,
};

export const createCheckAuthorization = (options: {
  userId: string | null | undefined;
  orgId: string | null | undefined;
  orgRole: string | null | undefined;
  orgPermissions: string[] | null | undefined;
  __experimental_factorVerificationAge: [number, number] | null;
}): CheckAuthorizationWithCustomPermissions => {
  const { orgId, orgRole, userId, orgPermissions, __experimental_factorVerificationAge } = options;

  return params => {
    let orgAuthorization = null;
    let stepUpAuthorization = null;

    if (!userId) {
      return false;
    }

    if (params.role || params.permission) {
      const missingOrgs = !orgId || !orgRole || !orgPermissions;

      if (params.permission && !missingOrgs) {
        orgAuthorization = orgPermissions.includes(params.permission);
      }

      if (params.role && !missingOrgs) {
        orgAuthorization = orgRole === params.role;
      }
    }

    if (params.__experimental_assurance && __experimental_factorVerificationAge) {
      const hasValidFactorOne =
        __experimental_factorVerificationAge[0] === -1
          ? maxAgeToMinutes[params.__experimental_assurance.maxAge] > __experimental_factorVerificationAge[0]
          : false;
      const hasValidFactorTwo =
        __experimental_factorVerificationAge[1] === -1
          ? maxAgeToMinutes[params.__experimental_assurance.maxAge] > __experimental_factorVerificationAge[1]
          : false;

      if (params.__experimental_assurance.level === 'L1.firstFactor') {
        stepUpAuthorization = hasValidFactorOne;
      } else if (params.__experimental_assurance.level === 'L2.secondFactor') {
        stepUpAuthorization = hasValidFactorTwo;
      } else {
        stepUpAuthorization = hasValidFactorOne && hasValidFactorTwo;
      }
    }

    return [orgAuthorization, stepUpAuthorization].filter(Boolean).some(a => a === true);
  };
};
