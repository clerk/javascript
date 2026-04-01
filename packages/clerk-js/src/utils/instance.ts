import { isDevOrStagingUrl } from '@clerk/shared/internal/clerk-js/url';

const FRONTEND_API_DEV_OR_STG_REGEX = /^clerk\.([\w|-]+\.){2,4}(dev|com)$/i;

const FRONTEND_API_PROD_REGEX = /^clerk(\.[A-Z0-9_-]{1,256}){2,}$/i;

export function validateFrontendApi(frontendApi: string | null | undefined): boolean {
  if (!frontendApi) {
    return false;
  }

  if (isDevOrStagingUrl(frontendApi)) {
    return FRONTEND_API_DEV_OR_STG_REGEX.test(frontendApi);
  }

  return FRONTEND_API_PROD_REGEX.test(frontendApi);
}
