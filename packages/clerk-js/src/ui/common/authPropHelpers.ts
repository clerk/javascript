import { camelToSnake } from '@clerk/shared';
import type { DisplayConfigResource } from '@clerk/types';
import type { ParsedQs } from 'qs';
import qs from 'qs';

import type { SignInCtx, SignUpCtx } from '../types';

type ExtractAuthUrlKey =
  | keyof Pick<SignUpCtx, 'afterSignUpUrl' | 'afterSignInUrl'>
  | keyof Pick<SignInCtx, 'afterSignUpUrl' | 'afterSignInUrl'>;

type ExtractAuthPropOptions =
  | { queryParams: ParsedQs; displayConfig: DisplayConfigResource } & (
      | {
          ctx: Omit<SignUpCtx, 'componentName'>;
        }
      | {
          ctx: Omit<SignInCtx, 'componentName'>;
        }
    );

/**
 *
 * extractAuthProp(key, options)
 *
 * Retrieve auth redirect props passed through querystring parameters, component props
 * or display config settings.
 *
 * The priority is:
 * Querystring parameters > ClerkJS component props > Display configuration payload
 */
export const extractAuthProp = (
  key: ExtractAuthUrlKey,
  { ctx, queryParams, displayConfig }: ExtractAuthPropOptions,
): string => {
  const snakeCaseField = camelToSnake(key);
  const queryParamValue = queryParams[snakeCaseField];

  return (
    (typeof queryParamValue === 'string' ? queryParamValue : null) ||
    (typeof queryParams.redirect_url === 'string' ? queryParams.redirect_url : null) ||
    ctx[key] ||
    ctx.redirectUrl ||
    displayConfig[key]
  );
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
