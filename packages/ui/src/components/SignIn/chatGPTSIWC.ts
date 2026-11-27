import { getQueryParams } from '@clerk/shared/internal/clerk-js/querystring';
import { isAllowedRedirect } from '@clerk/shared/internal/clerk-js/url';

type QueryParams = Record<string, string | undefined>;

const CHATGPT_SIWC_TARGET_FLOW = 'chatgpt_siwc';
const CHATGPT_SIWC_CONTINUE_PATH = '/oauth/authorize/continue';
const CHATGPT_SIWC_CONSENT_PATH = '/oauth-consent';
const CHATGPT_SIWC_MARKER_PREFIX = '__clerk_siwc_';

const hasChatGPTSIWCContinuation = (queryParams: QueryParams): boolean => {
  if (queryParams.target_flow !== CHATGPT_SIWC_TARGET_FLOW || !queryParams.redirect_url) {
    return false;
  }

  try {
    const continuation = new URL(queryParams.redirect_url);
    // An authorization that has already been validated and stored by FAPI can
    // hand off directly to consent. Account mismatch is discovered after that
    // handoff, so the hosted sign-in redirect points at `/oauth-consent` while
    // the original `/oauth/authorize/continue` request remains server-side.
    if (
      !continuation.pathname.endsWith(CHATGPT_SIWC_CONTINUE_PATH) &&
      !continuation.pathname.endsWith(CHATGPT_SIWC_CONSENT_PATH)
    ) {
      return false;
    }
    const params = continuation.searchParams;
    return (
      params.get('target_flow') === CHATGPT_SIWC_TARGET_FLOW &&
      Boolean(params.get('client_id')) &&
      Boolean(params.get('state')) &&
      Boolean(params.get('redirect_uri')) &&
      Boolean(params.get('code_challenge')) &&
      params.get('code_challenge_method') === 'S256'
    );
  } catch {
    return false;
  }
};

/**
 * Reports whether the query carries a well-formed SIWC continuation. It checks only the shape of
 * `redirect_url`: the sign-in and sign-up contexts drop the SIWC markers of a continuation that is
 * not on a trusted origin (see {@link resolveChatGPTSIWCQueryParams}), so components that read the
 * context's query params can rely on this check alone.
 */
export const isChatGPTSIWCFlow = hasChatGPTSIWCContinuation;

export const isChatGPTSIWCAccountMismatch = (queryParams: QueryParams): boolean =>
  isChatGPTSIWCFlow(queryParams) && queryParams.__clerk_siwc_account_mismatch === 'true';

export const isChatGPTSIWCAccountChoicePending = (queryParams: QueryParams): boolean =>
  isChatGPTSIWCFlow(queryParams) && queryParams.__clerk_siwc_account_choice_pending === 'true';

export const chatGPTSIWCOIDCPrompt = (
  existingPrompt: string | undefined,
  queryParams: QueryParams,
): string | undefined => {
  const prompts = new Set((existingPrompt || '').split(/\s+/).filter(Boolean));
  if (!hasChatGPTSIWCContinuation(queryParams)) {
    return prompts.size ? Array.from(prompts).join(' ') : undefined;
  }
  if (queryParams.__clerk_siwc_prompt_login === 'true') {
    prompts.add('login');
  }
  if (queryParams.__clerk_siwc_prompt_select_account === 'true') {
    prompts.add('select_account');
  }
  return prompts.size ? Array.from(prompts).join(' ') : undefined;
};

/**
 * The SIWC markers that must survive the OAuth round trip, so the SSO callback still knows it has
 * to record the account choice before it resumes the authorization.
 */
export const chatGPTSIWCAccountChoicePendingParams = {
  target_flow: CHATGPT_SIWC_TARGET_FLOW,
  __clerk_siwc_account_choice_pending: 'true',
};

type ChatGPTSIWCOriginSource = {
  frontendApi: string;
  proxyUrl?: string;
  allowedRedirectOrigins?: Array<string | RegExp>;
};

/**
 * Builds the check that a SIWC `redirect_url` points back at this instance: the authorization
 * continuation must be on the instance's Frontend API (directly or through its proxy), and the
 * consent page must be on an origin sign-in is already allowed to redirect to. `source` is read
 * lazily, so non-SIWC renders never touch it.
 */
export const createChatGPTSIWCContinuationGuard =
  (source: () => ChatGPTSIWCOriginSource) =>
  (redirectUrl: string): boolean => {
    try {
      const continuation = new URL(redirectUrl);
      const { frontendApi, proxyUrl, allowedRedirectOrigins } = source();
      if (continuation.pathname.endsWith(CHATGPT_SIWC_CONTINUE_PATH)) {
        const fapiOrigins = [`https://${frontendApi}`];
        if (proxyUrl) {
          fapiOrigins.push(new URL(proxyUrl, window.location.origin).origin);
        }
        return fapiOrigins.includes(continuation.origin);
      }
      if (continuation.pathname.endsWith(CHATGPT_SIWC_CONSENT_PATH)) {
        return isAllowedRedirect(allowedRedirectOrigins, window.location.origin)(continuation);
      }
      return false;
    } catch {
      return false;
    }
  };

const isChatGPTSIWCParamKey = (key: string) =>
  key === 'target_flow' ||
  key === 'redirect_url' ||
  key === 'login_hint' ||
  // FAPI forwards the outer `login_hint` to sign-in as `email_address`.
  key === 'email_address' ||
  key.startsWith(CHATGPT_SIWC_MARKER_PREFIX);

/**
 * Returns the query params the sign-in and sign-up flows should see.
 *
 * FAPI puts a SIWC continuation in `window.location.search`, which hash and virtual routers do not
 * read. Only when that query is a SIWC continuation on a trusted origin are its SIWC keys merged
 * under the routed params (router values still win after an in-component navigation). A SIWC flow
 * whose continuation is not trusted loses its SIWC markers, so a crafted link cannot start the
 * plugin flow. Any other query comes back as the routed params object, unchanged.
 */
export const resolveChatGPTSIWCQueryParams = (
  routedQueryParams: Record<string, string>,
  isTrustedContinuation: (redirectUrl: string) => boolean,
): Record<string, string> => {
  const isTrustedFlow = (params: QueryParams) =>
    hasChatGPTSIWCContinuation(params) && isTrustedContinuation(params.redirect_url as string);

  let queryParams = routedQueryParams;
  if (typeof window !== 'undefined') {
    const windowQueryParams = getQueryParams(window.location.search);
    if (isTrustedFlow(windowQueryParams)) {
      const siwcWindowQueryParams = Object.fromEntries(
        Object.entries(windowQueryParams).filter(([key]) => isChatGPTSIWCParamKey(key)),
      );
      queryParams = { ...siwcWindowQueryParams, ...routedQueryParams };
    }
  }

  if (queryParams.target_flow !== CHATGPT_SIWC_TARGET_FLOW || isTrustedFlow(queryParams)) {
    return queryParams;
  }

  return Object.fromEntries(
    Object.entries(queryParams).filter(([key]) => key !== 'target_flow' && !key.startsWith(CHATGPT_SIWC_MARKER_PREFIX)),
  );
};
