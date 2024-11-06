import { camelToSnake } from '@clerk/shared';
import type { ClerkOptions, DisplayConfigResource } from '@clerk/types';
import type { ParsedQs } from 'qs';
import qs from 'qs';

import { hasBannedProtocol, isAllowedRedirectOrigin, isValidUrl } from './url';

type PickRedirectionUrlKey = 'afterSignUpUrl' | 'afterSignInUrl' | 'signInUrl' | 'signUpUrl';

type PickRedirectionOptions = {
  queryParams?: ParsedQs;
  displayConfig?: DisplayConfigResource;
  options?: ClerkOptions;
  ctx?: any;
};

/**
 *
 * pickRedirectionProp(key, options, accessRedirectUrl)
 *
 * Retrieve auth redirect props passed through querystring parameters, component props, ClerkProvider props
 * or display config settings.
 *
 * The priority is:
 * 1. Querystring parameters
 * 2. ClerkJS component props
 * 3. ClerkProvider props
 * 4. Display configuration payload
 */
export const pickRedirectionProp = (
  key: PickRedirectionUrlKey,
  { ctx, queryParams, displayConfig, options }: PickRedirectionOptions,
  accessRedirectUrl = true,
): string => {
  const snakeCaseField = camelToSnake(key);
  const queryParamValue = queryParams?.[snakeCaseField];

  const primaryQueryParamRedirectUrl = typeof queryParamValue === 'string' ? queryParamValue : undefined;
  const secondaryQueryParamRedirectUrl =
    accessRedirectUrl && typeof queryParams?.redirect_url === 'string' ? queryParams.redirect_url : undefined;

  let queryParamUrl: string | undefined;
  if (
    primaryQueryParamRedirectUrl &&
    isAllowedRedirectOrigin(primaryQueryParamRedirectUrl, options?.allowedRedirectOrigins)
  ) {
    queryParamUrl = primaryQueryParamRedirectUrl;
  } else if (
    secondaryQueryParamRedirectUrl &&
    isAllowedRedirectOrigin(secondaryQueryParamRedirectUrl, options?.allowedRedirectOrigins)
  ) {
    queryParamUrl = secondaryQueryParamRedirectUrl;
  }

  const url =
    queryParamUrl ||
    ctx?.[key] ||
    (accessRedirectUrl ? ctx?.redirectUrl : undefined) ||
    options?.[key] ||
    displayConfig?.[key];

  if (!isValidUrl(url, { includeRelativeUrls: true }) || hasBannedProtocol(url)) {
    return '';
  }
  return url;
};

interface BuildAuthQueryStringArgs {
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  displayConfig: DisplayConfigResource;
}

export const buildAuthQueryString = (data: BuildAuthQueryStringArgs): string | null => {
  const parseValue = (field: keyof Omit<BuildAuthQueryStringArgs, 'displayConfig'>) => {
    const passed = data[field];
    if (!passed) {
      return undefined;
    }

    // We don't need to modify the query string at all
    // if the URL matches displayConfig
    if (passed === data.displayConfig[field]) {
      return undefined;
    }

    // Convert relative urls to absolute ones
    // Needed because auth modals the hosted pages sso-callback,
    // so an absolute redirectUrl is necessary
    if (passed.startsWith('/')) {
      return window.location.origin + passed;
    }

    return passed;
  };

  const parsedAfterSignInUrl = parseValue('afterSignInUrl');
  const parsedAfterSignUpUrl = parseValue('afterSignUpUrl');

  // Build the query string
  const query: Record<string, string> = {};
  if (parsedAfterSignInUrl && parsedAfterSignInUrl === parsedAfterSignUpUrl) {
    query.redirect_url = parsedAfterSignInUrl;
  } else {
    if (parsedAfterSignUpUrl) {
      query.after_sign_up_url = parsedAfterSignUpUrl;
    }
    if (parsedAfterSignInUrl) {
      query.after_sign_in_url = parsedAfterSignInUrl;
    }
  }
  return Object.keys(query).length === 0 ? null : qs.stringify(query);
};
