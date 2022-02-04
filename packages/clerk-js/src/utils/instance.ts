import { isDevOrStagingUrl } from 'utils';

const FRONTEND_API_DEV_OR_STG_REGEX = /^clerk\.\w+\.[\w-]+\.(\w+.){1,2}(dev|com)$/i;

const FRONTEND_API_PROD_REGEX = /^clerk(\.[-a-zA-Z0-9@:%_+~#=]{1,256}){2,}$/i;

export function validateFrontendApi(
  frontendApi: string | null | undefined,
): boolean {
  if (!frontendApi) {
    return false;
  }

  if (isDevOrStagingUrl(frontendApi)) {
    return FRONTEND_API_DEV_OR_STG_REGEX.test(frontendApi);
  }

  return FRONTEND_API_PROD_REGEX.test(frontendApi);
}
