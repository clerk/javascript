import { useClerk } from '@clerk/shared/react';
import type {
  AuthenticateWithNativeRedirectParams,
  ExternalAccountResource,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  SignInResource,
  SignUpResource,
  UserResource,
} from '@clerk/shared/types';

import { useCardState } from '@/ui/elements/contexts';
import { getClerkElectronBridge } from '@/ui/utils/electron';
import { handleError } from '@/ui/utils/errorHandler';
import { connectExternalAccountWithElectron } from '@/ui/utils/externalVerificationRedirect';
import { authenticateWithNativeRedirect } from '@/ui/utils/nativeRedirect';

import { useRouter } from '../router';

type CallbackParams = HandleOAuthCallbackParams | HandleSamlCallbackParams;

type AuthenticateSignInOptions = {
  resource: SignInResource;
  params: Omit<AuthenticateWithNativeRedirectParams, 'transport'>;
  callbackParams: CallbackParams;
};

type AuthenticateSignUpOptions = {
  resource: SignUpResource;
  params: Omit<AuthenticateWithNativeRedirectParams, 'transport'> & { unsafeMetadata?: SignUpUnsafeMetadata };
  callbackParams: CallbackParams;
};

type ConnectExternalAccountOptions = {
  createExternalAccount: (redirectUrl: string) => Promise<ExternalAccountResource | undefined>;
  user: UserResource;
};

type AuthenticateOptions = {
  /**
   * When `true` (default) the error is surfaced on the card before rethrowing. Set to `false` when
   * the caller owns error recovery (e.g. SignInStart's `attemptToRecoverFromSignInError`, which
   * silently recovers session-exists / instant-password errors that should not flash on the card).
   */
  surfaceErrorOnCard?: boolean;
};

export type NativeExternalAuth = {
  /**
   * Drives a sign-in/sign-up/enterprise-SSO OAuth flow through the native bridge. Rejects on failure
   * (after surfacing the error on the card, unless `surfaceErrorOnCard` is `false`) so callers such
   * as the social buttons can reset their loading state from the rejection.
   */
  authenticate: (
    opts: AuthenticateSignInOptions | AuthenticateSignUpOptions,
    options?: AuthenticateOptions,
  ) => Promise<unknown>;
  /**
   * Connects or reauthorizes an external account through the native bridge. Errors are surfaced on
   * the card and swallowed (not rethrown), since the connected-account UIs reset their own loading
   * state from a `finally`.
   */
  connectExternalAccount: (opts: ConnectExternalAccountOptions) => Promise<void>;
};

/**
 * Bridges Clerk's prebuilt OAuth/enterprise-SSO entry points to the native (Electron) deep-link flow.
 *
 * Returns `null` in non-native environments so callers fall back to the web redirect/popup flows.
 * When a native bridge is present it returns helpers that own the bridge, router, and card-level
 * error handling, keeping the call sites free of native-specific branching.
 *
 * @experimental
 */
export function useNativeExternalAuth(): NativeExternalAuth | null {
  const clerk = useClerk();
  const card = useCardState();
  const { navigate } = useRouter();
  const bridge = getClerkElectronBridge();

  if (!bridge) {
    return null;
  }

  return {
    authenticate: async ({ resource, params, callbackParams }, { surfaceErrorOnCard = true } = {}) => {
      try {
        return await authenticateWithNativeRedirect({
          clerk,
          bridge,
          // The discriminated overloads of `authenticateWithNativeRedirect` match on the resource
          // type, which these options already encode together with their params.
          resource: resource as SignInResource,
          params: params as AuthenticateWithNativeRedirectParams,
          callbackParams,
          navigate,
        });
      } catch (err) {
        if (surfaceErrorOnCard) {
          handleError(err as Error, [], card.setError);
        }
        throw err;
      }
    },
    connectExternalAccount: async ({ createExternalAccount, user }) => {
      try {
        await connectExternalAccountWithElectron({ bridge, createExternalAccount, user });
      } catch (err) {
        handleError(err as Error, [], card.setError);
      }
    },
  };
}
