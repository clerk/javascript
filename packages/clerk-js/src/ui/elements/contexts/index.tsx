import { createContextAndHook } from '@clerk/shared/react';
import type { ClerkAPIError, ClerkRuntimeError } from '@clerk/shared/types';
import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react';
import React from 'react';

import { useRouter } from '@/ui/router';

import { useLocalizations } from '../../customizables';

type Status = 'idle' | 'loading' | 'error';
type Metadata = string | undefined;
type State = { status: Status; metadata: Metadata; error: string | undefined };
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
  const setError = (metadata: ClerkRuntimeError | ClerkAPIError | Metadata | string) =>
    setState(s => ({ ...s, error: translateError(metadata) }));
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
    | 'oauthConsent'
    | 'subscriptionDetails'
    | 'tasks'
    | 'taskChooseOrganization';
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
    | 'havingTrouble'
    | 'ssoCallback'
    | 'popupCallback'
    | 'popover'
    | 'complete'
    | 'accountSwitcher'
    | 'chooseOrganization'
    | 'enterpriseConnections'
    | 'choose-wallet';
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
