import type { RedirectOptions, SessionResource, SignInResource, SignUpResource } from '@clerk/shared/types';
import React, { type ReactNode, useEffect, useRef } from 'react';

import { isClerkAPIResponseError } from '../errors';
import { useClerk } from '../hooks';

const HANDOFF_SEARCH_PARAM_KEYS = ['__clerk_ticket', '__clerk_status', '__clerk_created_session'] as const;

const REDIRECT_SEARCH_PARAM_KEYS = [
  'redirect_url',
  'sign_in_force_redirect_url',
  'sign_in_fallback_redirect_url',
  'sign_up_force_redirect_url',
  'sign_up_fallback_redirect_url',
] as const;

type HandoffNavigate = (to: string) => void | Promise<unknown>;

export interface HandoffProps {
  signInUrl?: string;
  signUpUrl?: string;
  firstFactorUrl?: string;
  secondFactorUrl?: string;
  resetPasswordUrl?: string;
  continueSignUpUrl?: string | null;
  verifyEmailAddressUrl?: string | null;
  verifyPhoneNumberUrl?: string | null;
  forceRedirectUrl?: string | null;
  fallbackRedirectUrl?: string | null;
  signInForceRedirectUrl?: string | null;
  signInFallbackRedirectUrl?: string | null;
  signUpForceRedirectUrl?: string | null;
  signUpFallbackRedirectUrl?: string | null;
  unsafeMetadata?: SignUpResource['unsafeMetadata'];
  transferable?: boolean;
  navigate?: HandoffNavigate;
  onError?: (error: unknown) => void;
}

type HandoffFlow = 'signIn' | 'signUp';

type HandoffClerk = ReturnType<typeof useClerk>;
type HandoffSignInResource = SignInResource & { isTransferable?: boolean };
type HandoffSignUpResource = SignUpResource & { isTransferable?: boolean };

const DUMMY_URL_BASE = 'http://clerk-dummy';

const SESSION_TASK_ROUTES: Record<string, string> = {
  'choose-organization': 'choose-organization',
  'reset-password': 'reset-password',
  'setup-mfa': 'setup-mfa',
};

const TERMINAL_HANDOFF_ERROR_CODES = new Set([
  'ticket_expired_code',
  'ticket_invalid_code',
  'sign_in_token_revoked_code',
  'sign_in_token_already_used_code',
  'sign_in_token_cannot_be_used_code',
  'sign_in_token_not_in_sign_in_code',
]);

const setIfDefined = (params: URLSearchParams, key: string, value: string | null | undefined) => {
  if (value) {
    params.set(key, value);
  }
};

const getCurrentSearchParams = () => new URL(window.location.href).searchParams;

const getHandoffSearchParams = () => {
  const current = getCurrentSearchParams();
  const params = new URLSearchParams();

  for (const key of HANDOFF_SEARCH_PARAM_KEYS) {
    const value = current.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  return params;
};

const removeHandoffSearchParams = () => {
  const url = new URL(window.location.href);
  let didUpdate = false;

  for (const key of HANDOFF_SEARCH_PARAM_KEYS) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      didUpdate = true;
    }
  }

  if (didUpdate) {
    window.history.replaceState(window.history.state, '', url);
  }
};

const getRedirectSearchParams = (props: HandoffProps, redirectUrl?: string) => {
  const current = getCurrentSearchParams();
  const params = new URLSearchParams();

  for (const key of REDIRECT_SEARCH_PARAM_KEYS) {
    const value = current.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  setIfDefined(params, 'sign_in_force_redirect_url', props.signInForceRedirectUrl ?? props.forceRedirectUrl);
  setIfDefined(params, 'sign_in_fallback_redirect_url', props.signInFallbackRedirectUrl ?? props.fallbackRedirectUrl);
  setIfDefined(params, 'sign_up_force_redirect_url', props.signUpForceRedirectUrl ?? props.forceRedirectUrl);
  setIfDefined(params, 'sign_up_fallback_redirect_url', props.signUpFallbackRedirectUrl ?? props.fallbackRedirectUrl);
  setIfDefined(params, 'redirect_url', redirectUrl);

  return params;
};

const getRedirectOptions = (props: HandoffProps, redirectUrl?: string): RedirectOptions => ({
  redirectUrl,
  signInForceRedirectUrl: props.signInForceRedirectUrl ?? props.forceRedirectUrl,
  signInFallbackRedirectUrl: props.signInFallbackRedirectUrl ?? props.fallbackRedirectUrl,
  signUpForceRedirectUrl: props.signUpForceRedirectUrl ?? props.forceRedirectUrl,
  signUpFallbackRedirectUrl: props.signUpFallbackRedirectUrl ?? props.fallbackRedirectUrl,
});

const joinPaths = (...paths: Array<string | undefined>) => {
  return `/${paths.join('/')}`.replace(/\/+/g, '/');
};

const buildUrl = ({
  base,
  hashPath,
  searchParams,
  hashSearchParams,
}: {
  base: string;
  hashPath?: string;
  searchParams?: URLSearchParams;
  hashSearchParams?: URLSearchParams;
}) => {
  const url = new URL(base, window.location.href);

  searchParams?.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  if (hashPath || hashSearchParams) {
    const hashUrl = new URL(url.hash.substring(1) || '/', DUMMY_URL_BASE);
    hashUrl.pathname = joinPaths(hashUrl.pathname, hashPath);
    hashSearchParams?.forEach((value, key) => {
      hashUrl.searchParams.set(key, value);
    });

    const newHash = `${hashUrl.pathname}${hashUrl.search}`;
    if (newHash !== '/') {
      url.hash = newHash;
    }
  }

  return url.href;
};

const buildTaskUrl = (session: SessionResource, base: string) => {
  const taskKey = session.currentTask?.key;
  const taskRoute = taskKey && SESSION_TASK_ROUTES[taskKey];

  if (!taskRoute) {
    return null;
  }

  return buildUrl({
    base,
    hashPath: `/tasks/${taskRoute}`,
  });
};

const getAfterSignInUrl = (clerk: HandoffClerk, props: HandoffProps) => {
  return clerk.buildAfterSignInUrl({ params: getRedirectSearchParams(props) }) || '/';
};

const getAfterSignUpUrl = (clerk: HandoffClerk, props: HandoffProps) => {
  return clerk.buildAfterSignUpUrl({ params: getRedirectSearchParams(props) }) || '/';
};

const getSignInUrl = (
  clerk: HandoffClerk,
  props: HandoffProps,
  {
    hashPath,
    preserveHandoffParams = false,
  }: {
    hashPath?: string;
    preserveHandoffParams?: boolean;
  } = {},
) => {
  const redirectUrl = getAfterSignInUrl(clerk, props);
  const searchParams = preserveHandoffParams ? getHandoffSearchParams() : undefined;

  if (props.signInUrl) {
    return buildUrl({
      base: props.signInUrl,
      hashPath,
      searchParams,
      hashSearchParams: getRedirectSearchParams(props, redirectUrl),
    });
  }

  return buildUrl({
    base: clerk.buildSignInUrl(getRedirectOptions(props, redirectUrl)) || '/sign-in',
    hashPath,
    searchParams,
  });
};

const getSignUpUrl = (
  clerk: HandoffClerk,
  props: HandoffProps,
  {
    hashPath,
    preserveHandoffParams = false,
  }: {
    hashPath?: string;
    preserveHandoffParams?: boolean;
  } = {},
) => {
  const redirectUrl = getAfterSignUpUrl(clerk, props);
  const searchParams = preserveHandoffParams ? getHandoffSearchParams() : undefined;

  if (props.signUpUrl) {
    return buildUrl({
      base: props.signUpUrl,
      hashPath,
      searchParams,
      hashSearchParams: getRedirectSearchParams(props, redirectUrl),
    });
  }

  return buildUrl({
    base: clerk.buildSignUpUrl(getRedirectOptions(props, redirectUrl)) || '/sign-up',
    hashPath,
    searchParams,
  });
};

const getSignInStepUrl = (
  clerk: HandoffClerk,
  props: HandoffProps,
  stepUrl: string | undefined,
  fallbackHashPath?: string,
) => {
  if (stepUrl) {
    return buildUrl({
      base: stepUrl,
      searchParams: getHandoffSearchParams(),
      hashSearchParams: getRedirectSearchParams(props, getAfterSignInUrl(clerk, props)),
    });
  }

  return getSignInUrl(clerk, props, { hashPath: fallbackHashPath, preserveHandoffParams: true });
};

const getSignUpStepUrl = (
  clerk: HandoffClerk,
  props: HandoffProps,
  stepUrl: string | null | undefined,
  fallbackHashPath: string,
) => {
  if (stepUrl) {
    return buildUrl({
      base: stepUrl,
      searchParams: getHandoffSearchParams(),
      hashSearchParams: getRedirectSearchParams(props, getAfterSignUpUrl(clerk, props)),
    });
  }

  return getSignUpUrl(clerk, props, { hashPath: fallbackHashPath, preserveHandoffParams: true });
};

const getCompletedSessionId = (resource: SignInResource | SignUpResource) => {
  if (resource.status !== 'complete' || !resource.createdSessionId) {
    return null;
  }

  return resource.createdSessionId;
};

const getTaskBaseUrl = (clerk: HandoffClerk, props: HandoffProps, flow: HandoffFlow) => {
  return flow === 'signIn' ? getSignInUrl(clerk, props) : getSignUpUrl(clerk, props);
};

const isTerminalHandoffError = (error: unknown) => {
  return isClerkAPIResponseError(error) && error.errors.some(e => TERMINAL_HANDOFF_ERROR_CODES.has(e.code));
};

export function Handoff(props: HandoffProps): ReactNode {
  const clerk = useClerk();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) {
      return;
    }

    hasRun.current = true;

    const loadedClerk = clerk;
    const navigate = async (to: string) => {
      await (props.navigate || loadedClerk.navigate)(to);
    };

    const handleError = async (error: unknown) => {
      props.onError?.(error);

      if (isTerminalHandoffError(error)) {
        removeHandoffSearchParams();
      }

      await navigate(getSignInUrl(loadedClerk, props));
    };

    const activateSession = async (resource: SignInResource | SignUpResource, flow: HandoffFlow) => {
      const sessionId = getCompletedSessionId(resource);

      if (!sessionId) {
        removeHandoffSearchParams();
        throw new Error('Clerk handoff completed without a created session.');
      }

      removeHandoffSearchParams();

      const redirectUrl =
        flow === 'signIn' ? getAfterSignInUrl(loadedClerk, props) : getAfterSignUpUrl(loadedClerk, props);
      const taskBaseUrl = getTaskBaseUrl(loadedClerk, props, flow);

      await loadedClerk.setActive({
        session: sessionId,
        navigate: async ({
          session,
          decorateUrl,
        }: {
          session: SessionResource;
          decorateUrl: (url: string) => string;
        }) => {
          const destination = buildTaskUrl(session, taskBaseUrl) || redirectUrl;
          await navigate(decorateUrl(destination));
        },
      });
    };

    const routeSignIn = async (signIn: HandoffSignInResource) => {
      const sessionId = getCompletedSessionId(signIn);

      if (sessionId) {
        await activateSession(signIn, 'signIn');
        return;
      }

      if (signIn.isTransferable) {
        await navigate(
          props.transferable === false
            ? getSignInUrl(loadedClerk, props, { preserveHandoffParams: true })
            : getSignUpUrl(loadedClerk, props, { preserveHandoffParams: true }),
        );
        return;
      }

      switch (signIn.status) {
        case 'needs_first_factor':
        case 'needs_client_trust':
          await navigate(getSignInStepUrl(loadedClerk, props, props.firstFactorUrl, '/factor-one'));
          return;
        case 'needs_second_factor':
          await navigate(getSignInStepUrl(loadedClerk, props, props.secondFactorUrl, '/factor-two'));
          return;
        case 'needs_new_password':
          await navigate(getSignInStepUrl(loadedClerk, props, props.resetPasswordUrl, '/reset-password'));
          return;
        default:
          await navigate(getSignInUrl(loadedClerk, props, { preserveHandoffParams: true }));
      }
    };

    const routeSignUp = async (signUp: HandoffSignUpResource) => {
      const sessionId = getCompletedSessionId(signUp);

      if (sessionId) {
        await activateSession(signUp, 'signUp');
        return;
      }

      if (signUp.isTransferable) {
        await navigate(getSignInUrl(loadedClerk, props, { preserveHandoffParams: true }));
        return;
      }

      if (signUp.unverifiedFields?.includes('email_address')) {
        await navigate(getSignUpStepUrl(loadedClerk, props, props.verifyEmailAddressUrl, '/verify-email-address'));
        return;
      }

      if (signUp.unverifiedFields?.includes('phone_number')) {
        await navigate(getSignUpStepUrl(loadedClerk, props, props.verifyPhoneNumberUrl, '/verify-phone-number'));
        return;
      }

      await navigate(getSignUpStepUrl(loadedClerk, props, props.continueSignUpUrl, '/continue'));
    };

    const run = async () => {
      if (!loadedClerk.client) {
        throw new Error('Clerk handoff requires a loaded client.');
      }

      const ticket = getCurrentSearchParams().get('__clerk_ticket');

      if (!ticket) {
        await navigate(
          loadedClerk.user || loadedClerk.session
            ? getAfterSignInUrl(loadedClerk, props)
            : getSignInUrl(loadedClerk, props),
        );
        return;
      }

      if (getCurrentSearchParams().get('__clerk_status') === 'sign_up') {
        await routeSignUp(
          await loadedClerk.client.signUp.create({
            strategy: 'ticket',
            ticket,
            unsafeMetadata: props.unsafeMetadata,
          }),
        );
        return;
      }

      await routeSignIn(
        await loadedClerk.client.signIn.create({
          strategy: 'ticket',
          ticket,
        }),
      );
    };

    void run().catch(error => {
      void handleError(error);
    });
  }, [clerk, clerk.loaded, props]);

  return <div id='clerk-captcha' />;
}
