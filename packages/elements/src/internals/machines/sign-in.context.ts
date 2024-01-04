import type { OAuthStrategy, Web3Strategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import type { SnapshotFrom } from 'xstate';

import {
  getEnabledThirdPartyProviders,
  isAuthenticatableOauthStrategy,
  isWeb3Strategy,
} from '../../utils/third-party-strategies';
import { SignInMachine } from './sign-in.machine';
import type { FieldDetails } from './sign-in.types';

export type SnapshotState = SnapshotFrom<typeof SignInMachine>;

// ================= MACHINE CONTEXT/HOOKS ================= //

export const {
  Provider: SignInFlowProvider,
  useActorRef: useSignInFlow,
  useSelector: useSignInFlowSelector,
} = createActorContext(SignInMachine);

// ================= SELECTORS ================= //

/**
 * Selects if a specific field has a value
 */
const fieldHasValueSelector = (type: string | undefined) => (state: SnapshotState) =>
  type ? Boolean(state.context.fields.get(type)?.value) : false;

/**
 * Selects a field-specific error, if it exists
 */
const fieldErrorsSelector = (type: string | undefined) => (state: SnapshotState) =>
  type ? state.context.fields.get(type)?.errors : undefined;

/**
 * Selects a global error, if it exists
 */
const globalErrorsSelector = (state: SnapshotState) => state.context.errors;

/**
 * Selects the clerk environment
 */
const clerkEnvironmentSelector = (state: SnapshotState) => state.context.environment;

// ================= HOOKS ================= //

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
export const useForm = () => {
  const ref = useSignInFlow();
  const error = useSignInFlowSelector(globalErrorsSelector);

  const validity = error ? 'invalid' : 'valid';

  // Register the onSubmit handler for form submission
  const onSubmit = useCallback(
    (event: React.FormEvent<Element>) => {
      event.preventDefault();
      ref.send({ type: 'SUBMIT' });
    },
    [ref],
  );

  return {
    props: {
      [`data-${validity}`]: true,
      onSubmit,
    },
  };
};

/**
 * Provides the onClick handler for oauth
 */
export const useThirdPartyProviders = () => {
  const ref = useSignInFlow();
  const env = useSignInFlowSelector(clerkEnvironmentSelector);
  const providers = useMemo(() => env && getEnabledThirdPartyProviders(env), [env]);

  // Register the onSubmit handler for button click
  const createOnClick = useCallback(
    (strategy: Web3Strategy | OAuthStrategy) => {
      return (event: React.MouseEvent<Element>) => {
        if (!providers) return;

        event.preventDefault();

        if (isWeb3Strategy(strategy, providers.web3Strategies)) {
          return ref.send({ type: 'AUTHENTICATE.WEB3', strategy });
        }

        if (isAuthenticatableOauthStrategy(strategy, providers.authenticatableOauthStrategies)) {
          return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy });
        }

        throw new Error(`${strategy} is not yet supported.`);
      };
    },
    [ref, providers],
  );

  if (!providers) {
    return null;
  }

  return {
    ...providers,
    createOnClick,
  };
};

export type FieldContextValue = {
  name: string;
};
export const FieldContext = React.createContext<FieldContextValue>({ name: '' });

export function useFieldDetails() {
  const ctx = useContext(FieldContext);

  if (!ctx.name) {
    throw new Error('useFieldDetails must be used within a FieldContextProvider');
  }

  return ctx;
}

/**
 * Provides field-specfic props based on the field's type/state
 */
export const useField = ({ type }: Partial<Pick<FieldDetails, 'type'>>) => {
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(type));
  const error = useSignInFlowSelector(fieldErrorsSelector(type));

  const shouldBeHidden = false; // TODO: Implement clerk-js utils
  const hasError = Boolean(error);
  const validity = hasError ? 'invalid' : 'valid';

  return {
    hasValue,
    props: {
      [`data-${validity}`]: true,
      'data-hidden': shouldBeHidden ? true : undefined,
      serverInvalid: hasError,
      tabIndex: shouldBeHidden ? -1 : 0,
    },
  };
};

/**
 * Provides field-error/message-specfic props based on the field's type/state
 */
export const useFieldErrors = ({ type }: Partial<Pick<FieldDetails, 'type'>>) => {
  const errors = useSignInFlowSelector(fieldErrorsSelector(type));

  return {
    errors,
  };
};

/**
 * Provides global errors
 */
export const useGlobalErrors = () => {
  const error = useSignInFlowSelector(globalErrorsSelector);
  const validity = error ? 'invalid' : 'valid';

  return {
    message: error?.message,
    props: {
      // TODO: Handle accessibility
      [`data-${validity}`]: true,
    },
  };
};

/**
 * Provides control (input)-specfic props based on the field/input's type/state
 */
export const useInput = ({ type, value: initialValue }: Partial<Pick<FieldDetails, 'type' | 'value'>>) => {
  const { name } = useFieldDetails();
  const ref = useSignInFlow();
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(type));

  // Add the field to the machine context, esuring it's only added once
  useEffect(() => {
    if (!type || ref.getSnapshot().context.fields.get(type)) return;

    ref.send({ type: 'FIELD.ADD', field: { type, value: initialValue } });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { type } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!type) return;
      ref.send({ type: 'FIELD.UPDATE', field: { type, value: event.target.value } });
    },
    [ref, type],
  );

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;

  // Return all valid states and props for the input
  return {
    hasValue,
    props: {
      name,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      onChange,
      tabIndex: shouldBeHidden ? -1 : 0,
    },
  };
};

/**
 * Ensures that the callback handler is sent to the machine once the environment is loaded
 */
export const useSSOCallbackHandler = () => {
  const ref = useSignInFlow();
  const hasEnv = useSignInFlowSelector(clerkEnvironmentSelector);

  // TODO: Wholesale move this to the machine ?
  // Wait for the environment to be loaded before sending the callback event
  useEffect(() => {
    if (!hasEnv) {
      return;
    }

    ref.send({ type: 'OAUTH.CALLBACK' });
  }, [hasEnv]); // eslint-disable-line react-hooks/exhaustive-deps
};
