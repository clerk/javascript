import { isClerkAPIResponseError } from '@clerk/shared/error';
import { __internal_useOrganizationSSOBypassAllowlist } from '@clerk/shared/react';

export const useSecuritySSOBypassSectionModel = () => {
  const { data, isLoading, error } = __internal_useOrganizationSSOBypassAllowlist();
  const isFeatureNotEnabled =
    error !== null &&
    isClerkAPIResponseError(error) &&
    error.errors.some(responseError => responseError.code === 'feature_not_enabled');

  return {
    status: isFeatureNotEnabled ? 'hidden' : isLoading ? 'loading' : error ? 'error' : 'ready',
    count: data?.length ?? 0,
    errorMessage: error?.message,
  } as const;
};
