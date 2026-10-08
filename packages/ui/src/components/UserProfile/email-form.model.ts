import { ClerkRuntimeError } from '@clerk/shared/error';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type {
  EmailAddressResource,
  EnvironmentResource,
  PrepareEmailAddressVerificationParams,
} from '@clerk/shared/types';
import { useEffect, useReducer, useRef } from 'react';

import { useRouter } from '@/router';
import { buildVerificationRedirectUrl } from '@/ui/common/redirects';
import { useEnvironment, useUserProfileContext } from '@/ui/contexts';

import type { EmailFormData, EmailFormProps, EmailVerificationFlow } from './email-form.types';
import { useProfileRequestScopeModel } from './profile-request-scope.model';
import { isAttributeAvailable } from './utils';

export const useEmailFormModel = ({ emailId }: EmailFormProps): EmailFormData => {
  const clerk = useClerk();
  const { user } = useUser();
  const environment = useEnvironment();
  const profileContext = useUserProfileContext();
  const { navigate } = useRouter();
  const scope = useProfileRequestScopeModel(JSON.stringify(['profile-email', emailId]));
  const created = useRef<EmailAddressResource>();
  const createdId = useRef<string>();
  const owner = useRef({ key: scope.requestKey, version: 0, flows: new Set<() => void>() });
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  if (owner.current.key !== scope.requestKey) {
    created.current = undefined;
    createdId.current = undefined;
    owner.current = { key: scope.requestKey, version: owner.current.version + 1, flows: new Set() };
  }
  const selectedOwner = owner.current;
  useEffect(
    () => () => {
      for (const cancel of selectedOwner.flows) {
        cancel();
      }
    },
    [selectedOwner],
  );
  const canVerify = () => scope.canRun() && owner.current === selectedOwner;
  const resolve = () => {
    if (!canVerify()) {
      return undefined;
    }
    const id = emailId ?? createdId.current;
    const canonical = id ? clerk.user?.emailAddresses.find(email => email.id === id) : undefined;
    if (canonical && !emailId) {
      created.current = undefined;
    }
    return canonical ?? (emailId ? undefined : created.current);
  };
  const requireEmail = () => {
    const current = resolve();
    if (!current) {
      throw new ClerkRuntimeError('The selected email address is no longer available.', {
        code: 'email_address_missing',
      });
    }
    return current;
  };
  const createEmailAddress = useReverification((email: string, isCurrent: () => boolean) =>
    isCurrent() ? clerk.user?.createEmailAddress({ email }) : undefined,
  );
  const verify = async (operation: (email: EmailAddressResource) => Promise<unknown>) => {
    if (!canVerify()) {
      return;
    }
    try {
      await operation(requireEmail());
    } catch (error) {
      if (canVerify()) {
        throw error;
      }
    }
  };
  const createFlow = (
    kind: 'email_link' | 'enterprise_sso',
    canContinue: () => boolean = () => true,
  ): EmailVerificationFlow => {
    let cancelled = false;
    let cancelSDK: (() => void) | undefined;
    let pending: Promise<boolean | void> | undefined;
    let finishCancellation!: (value: false) => void;
    const cancellation = new Promise<false>(resolve => {
      finishCancellation = resolve;
    });
    const isCurrent = () => !cancelled && canVerify() && canContinue();
    const cancel = () => {
      if (!cancelled) {
        cancelled = true;
        selectedOwner.flows.delete(cancel);
        try {
          cancelSDK?.();
        } finally {
          finishCancellation(false);
        }
      }
    };
    selectedOwner.flows.add(cancel);
    return {
      cancel,
      start: () => {
        if (!isCurrent()) {
          return Promise.resolve(false);
        }
        if (pending) {
          return pending;
        }
        pending = Promise.race([
          (async () => {
            try {
              const email = requireEmail();
              if (kind === 'email_link') {
                const flow = email.createEmailLinkFlow();
                cancelSDK = flow.cancelEmailLinkFlow;
                const baseUrl = profileContext.routing === 'virtual' ? environment.displayConfig.userProfileUrl : '';
                const redirectUrl = buildVerificationRedirectUrl({ ctx: profileContext, baseUrl, intent: 'profile' });
                if (!isCurrent()) {
                  cancel();
                  return false;
                }
                await flow.startEmailLinkFlow({ redirectUrl });
              } else {
                const flow = email.createEnterpriseSSOLinkFlow();
                cancelSDK = flow.cancelEnterpriseSSOLinkFlow;
                const { mode, componentName } = profileContext;
                const redirectUrl =
                  mode === 'modal'
                    ? appendModalState({ url: window.location.href, componentName })
                    : window.location.href;
                if (!isCurrent()) {
                  cancel();
                  return false;
                }
                await flow.startEnterpriseSSOLinkFlow({ redirectUrl });
              }
              if (!isCurrent()) {
                return false;
              }
            } catch (error) {
              if (isCurrent()) {
                throw error;
              }
              return false;
            }
          })(),
          cancellation,
        ]);
        return pending;
      },
      ...(kind === 'enterprise_sso'
        ? {
            open: async () => {
              if (!isCurrent()) {
                return;
              }
              try {
                const url = requireEmail().verification.externalVerificationRedirectURL?.href;
                if (!url) {
                  throw new ClerkRuntimeError('The email verification redirect URL is not available.', {
                    code: 'email_verification_redirect_missing',
                  });
                }
                await navigate(url);
              } catch (error) {
                if (isCurrent()) {
                  throw error;
                }
              }
            },
          }
        : {}),
    };
  };
  const email = resolve();
  const strategy = getEmailAddressVerificationStrategy(email, environment);

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    hasExistingEmail: !!email,
    strategy,
    identifier: email?.emailAddress || '',
    username: user?.username,
    createEmail: async (email: string, canContinue?: () => boolean) => {
      const isCurrent = () => scope.canRun() && (canContinue?.() ?? true);
      if (!isCurrent()) {
        return false;
      }
      try {
        const address = await createEmailAddress(email, isCurrent);
        if (!address || !isCurrent()) {
          return false;
        }
        created.current = address;
        createdId.current = address.id;
        owner.current = { key: scope.requestKey, version: owner.current.version + 1, flows: new Set() };
        refresh();
        return true;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
    verification: {
      requestKey: JSON.stringify([scope.requestKey, selectedOwner.version, email?.id, strategy]),
      canRun: canVerify,
      identifier: email?.emailAddress || '',
      prepareVerification: () => verify(current => current.prepareVerification({ strategy: 'email_code' })),
      attemptVerification: code => verify(current => current.attemptVerification({ code })),
    },
    createEmailLinkFlow: canContinue => createFlow('email_link', canContinue),
    createEnterpriseSSOLinkFlow: canContinue => createFlow('enterprise_sso', canContinue),
  };
};

function isEmailLinksEnabledForInstance(env: EnvironmentResource): boolean {
  const { userSettings } = env;
  const { email_address } = userSettings.attributes;
  return Boolean(isAttributeAvailable(email_address) && email_address?.verifications.includes('email_link'));
}

/**
 * Determines the email verification strategy based on the email address resource
 * and instance
 *
 * @returns The verification strategy to use:
 *  - 'enterprise_sso' - If the email domain matches an enterprise SSO connection
 *  - 'email_link' - If email link verification is enabled for the instance
 *  - 'email_code' - Fallback strategy when email links are disabled
 */
const getEmailAddressVerificationStrategy = (
  emailAddress: EmailAddressResource | undefined,
  env: EnvironmentResource,
): PrepareEmailAddressVerificationParams['strategy'] => {
  if (emailAddress?.matchesSsoConnection) {
    return 'enterprise_sso';
  }

  return isEmailLinksEnabledForInstance(env) ? 'email_link' : 'email_code';
};
