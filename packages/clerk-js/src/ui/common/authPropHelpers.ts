import { camelToSnake } from '@clerk/shared/utils';
import type { DisplayConfigResource } from '@clerk/types';
import type { ParsedQs } from 'qs';
import qs from 'qs';
import type { SignInCtx, SignUpCtx } from 'ui/contexts';

type ParseAuthPropArgs =
  | {
      ctx: Omit<SignUpCtx, 'componentName'>;
      queryParams: ParsedQs;
      displayConfig: DisplayConfigResource;
      field: keyof Pick<SignUpCtx, 'afterSignUpUrl' | 'afterSignInUrl'>;
    }
  | {
      ctx: Omit<SignInCtx, 'componentName'>;
      queryParams: ParsedQs;
      displayConfig: DisplayConfigResource;
      field: keyof Pick<SignUpCtx, 'afterSignUpUrl' | 'afterSignInUrl'>;
    };

export const parseAuthProp = ({
  ctx,
  queryParams,
  displayConfig,
  field,
}: ParseAuthPropArgs): string => {
  const snakeCaseField = camelToSnake(field);

  // Todo: Dx: Deprecate afterSignIn and afterSignUp legacy fields
  const legacyField = field.replace('Url', '');
  let legacyFieldValue: string | undefined = undefined;
  if (legacyField in ctx) {
    // @ts-ignore
    legacyFieldValue = ctx[legacyField];
  }
  const queryParamValue = queryParams[snakeCaseField];

  return (
    (typeof queryParamValue === 'string' ? queryParamValue : null) ||
    (typeof queryParams.redirect_url === 'string'
      ? queryParams.redirect_url
      : null) ||
    ctx[field] ||
    legacyFieldValue ||
    ctx.redirectUrl ||
    displayConfig[field]
  );
};

interface BuildAuthQueryStringArgs {
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  displayConfig: DisplayConfigResource;
}

export const buildAuthQueryString = (
  data: BuildAuthQueryStringArgs,
): string | null => {
  const parseValue = (
    field: keyof Omit<BuildAuthQueryStringArgs, 'displayConfig'>,
  ) => {
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
