import { createContextAndHook } from '@clerk/shared/react';
import type { ClerkAPIError, ClerkRuntimeError } from '@clerk/shared/types';
import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react';
import React from 'react';

import { useRouter } from '@/ui/router';

import { useLocalizations } from '../../customizables';
import type { ActionBlockedDetails } from '../../utils/actionBlocked';
import { actionBlockedDetailsFrom } from '../../utils/actionBlocked';

type Status = 'idle' | 'loading' | 'error';
type Metadata = string | undefined;
type State = {
  status: Status;
  metadata: Metadata;
  error: string | undefined;
  /** Set when the request was blocked and there is nothing to retry. */
  blockedDetails?: ActionBlockedDetails | undefined;
};
type CardStateCtxValue = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
};

const [CardStateCtx, _useCardState] = createContextAndHook<CardStateCtxValue>('CardState');

export const CardStateProvider = (props: React.PropsWithChildren<any>) => {
  const { translateError } = useLocalizations();
  const router = useRouter();

  const [state, setState] = React.useState<State>(() => ({
    status: 'idle',
    metadata: undefined,
    error: translateError(window?.Clerk?.__internal_last_error || undefined),
  }));

  React.useEffect(() => {
    const error = window?.Clerk?.__internal_last_error;

    if (error) {
      setState(s => ({ ...s, error: translateError(error) }));
    }
  }, [translateError, setState, router.currentPath]);

  const value = React.useMemo(() => ({ value: { state, setState } }), [state, setState]);
  return <CardStateCtx.Provider value={value}>{props.children}</CardStateCtx.Provider>;
};

export const useCardState = () => {
  const { state, setState } = _useCardState();
  const { translateError } = useLocalizations();

  const setIdle = (metadata?: Metadata) => setState(s => ({ ...s, status: 'idle', metadata }));
  /**
   * Sets the card's inline error — unless the request was BLOCKED, which is
   * terminal and gets its own screen instead.
   *
   * Detected here rather than in each card because every error in these flows
   * funnels through this one function: the form submit, the OAuth callback, and
   * a challenge submission that is then denied all arrive here. A card that
   * rendered this as an inline error would offer a Retry for something that
   * cannot succeed.
   *
   * It must happen BEFORE translateError, which flattens the error to a string
   * and discards the meta the screen is built from. Anything that is not a
   * blocked request, or that carries no details (an older backend), falls
   * through unchanged.
   */
  const setError = (metadata: ClerkRuntimeError | ClerkAPIError | Metadata | string) => {
    const blocked = actionBlockedDetailsFrom(metadata);
    if (blocked) {
      setState(s => ({ ...s, blockedDetails: blocked, error: undefined }));
      return;
    }
    // Clearing blockedDetails here is what keeps setError the single owner of
    // BOTH fields. Without it the blocked screen latches: every caller that
    // clears an error passes undefined or '' first — handleClerkApiError does,
    // and so does the protect-check runner — so a card that had once been
    // blocked could never show anything again, including the next real error.
    setState(s => ({ ...s, error: translateError(metadata), blockedDetails: undefined }));
  };
  const setLoading = (metadata?: Metadata) => setState(s => ({ ...s, status: 'loading', metadata }));
  const runAsync = async <T = unknown,>(cb: Promise<T> | (() => Promise<T>), metadata?: Metadata) => {
    setLoading(metadata);
    return (typeof cb === 'function' ? cb() : cb)
      .then(res => {
        return res;
      })
      .finally(() => setIdle(metadata));
  };

  return {
    setIdle,
    setError,
    setLoading,
    runAsync,
    loadingMetadata: state.status === 'loading' ? state.metadata : undefined,
    error: state.error ? state.error : undefined,
    /**
     * Set when the request was blocked and there is nothing to retry. A card
     * that can render the terminal screen checks this FIRST and returns it
     * instead of its normal body.
     */
    blockedDetails: state.blockedDetails,
    isLoading: state.status === 'loading',
    isIdle: state.status === 'idle',
    state,
  };
};

export const withCardStateProvider = <T,>(Component: React.ComponentType<T>) => {
  return (props: T) => {
    return (
      <CardStateProvider>
        {/* @ts-expect-error */}
        <Component {...props} />
      </CardStateProvider>
    );
  };
};

export type FlowMetadata = {
  flow:
    | 'signIn'
    | 'signUp'
    | 'userButton'
    | 'userProfile'
    | 'userVerification'
    | 'organizationProfile'
    | 'createOrganization'
    | 'organizationSwitcher'
    | 'organizationList'
    | 'oneTap'
    | 'blankCaptcha'
    | 'waitlist'
    | 'checkout'
    | 'planDetails'
    | 'pricingTable'
    | 'apiKeys'
    | 'configureSSO'
    | 'oauthConsent'
    | 'oauthDeviceVerification'
    | 'subscriptionDetails'
    | 'tasks'
    | 'taskChooseOrganization'
    | 'enableOrganizations'
    | 'taskResetPassword'
    | 'taskSetupMfa';
  part?:
    | 'start'
    | 'emailCode'
    | 'emailCode2Fa'
    | 'phoneCode'
    | 'phoneCode2Fa'
    | 'totp2Fa'
    | 'backupCode2Fa'
    | 'password'
    | 'resetPassword'
    | 'emailLink'
    | 'emailLinkVerify'
    | 'emailLinkStatus'
    | 'alternativeMethods'
    | 'forgotPasswordMethods'
    | 'passwordPwnedMethods'
    | 'passwordCompromisedMethods'
    | 'havingTrouble'
    | 'ssoCallback'
    | 'popupCallback'
    | 'popover'
    | 'complete'
    | 'accountSwitcher'
    | 'chooseOrganization'
    | 'chooseWallet'
    | 'enterpriseConnections'
    | 'organizationCreationDisabled'
    | 'methodSelectionMFA'
    | 'provideEmail'
    | 'selectProvider'
    | 'organizationDomains'
    | 'configureCreateApp'
    | 'configureMapAttributes'
    | 'testSso'
    | 'ssoActivate'
    | 'protectCheck'
    | 'actionBlocked';
};

const [FlowMetadataCtx, useFlowMetadata] = createContextAndHook<FlowMetadata>('FlowMetadata');

export const FlowMetadataProvider = (props: React.PropsWithChildren<FlowMetadata>) => {
  const { flow, part } = props;
  const value = React.useMemo(() => ({ value: props }), [flow, part]);
  return <FlowMetadataCtx.Provider value={value}>{props.children}</FlowMetadataCtx.Provider>;
};

export const withFloatingTree = <T,>(Component: React.ComponentType<T>): React.ComponentType<T> => {
  return (props: T) => {
    const parentId = useFloatingParentNodeId();
    if (parentId == null) {
      return (
        <FloatingTree>
          {/* @ts-expect-error */}
          <Component {...props} />
        </FloatingTree>
      );
    }

    /* @ts-expect-error */
    return <Component {...props} />;
  };
};

export { useFlowMetadata };
