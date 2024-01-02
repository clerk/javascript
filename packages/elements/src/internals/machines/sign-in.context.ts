import type { OAuthStrategy, Web3Strategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import { useCallback, useEffect } from 'react';

import { isAuthenticatableOauthStrategy, isWeb3Strategy } from '../../utils/third-party-strategies';
import { SignInMachine } from './sign-in.machine';
import type { FieldDetails, SnapshotState } from './sign-in.types';

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
const fieldErrorSelector = (type: string | undefined) => (state: SnapshotState) =>
  type ? Boolean(state.context.fields.get(type)?.error) : undefined;

/**
 * Selects a global error, if it exists
 */
const globalErrorSelector = (state: SnapshotState) => state.context.error;

/**
 * Selects if the environment is loaded
 */
const hasEnvironmentSelector = (state: SnapshotState) => Boolean(state.context.clerk.__unstable__environment);

/**
 * Selects third-party providers details
 */
const thirdPartyStrategiesSelector = (state: SnapshotState) =>
  state.context.enabledThirdPartyProviders ? state.context.enabledThirdPartyProviders : undefined;

// ================= HOOKS ================= //

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
export const useForm = () => {
  const ref = useSignInFlow();
  const error = useSignInFlowSelector(globalErrorSelector);

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
  const providers = useSignInFlowSelector(thirdPartyStrategiesSelector);

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

/**
 * Provides field-specfic props based on the field's type/state
 */
export const useField = ({ type }: Partial<Pick<FieldDetails, 'type'>>) => {
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(type));
  const error = useSignInFlowSelector(fieldErrorSelector(type));

  const shouldBeHidden = false; // TODO: Implement clerk-js utils
  const validity = error ? 'invalid' : 'valid';

  return {
    hasValue,
    props: {
      [`data-${validity}`]: true,
      'data-hidden': shouldBeHidden ? true : undefined,
      tabIndex: shouldBeHidden ? -1 : 0,
    },
  };
};

/**
 * Provides control (input)-specfic props based on the field/input's type/state
 */
export const useInput = ({ type, value: initialValue }: Partial<Pick<FieldDetails, 'type' | 'value'>>) => {
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
  const hasEnv = useSignInFlowSelector(hasEnvironmentSelector);

  // TODO: Wholesale move this to the machine ?
  // Wait for the environment to be loaded before sending the callback event
  useEffect(() => {
    if (!hasEnv) {
      return;
    }

    ref.send({ type: 'OAUTH.CALLBACK' });
  }, [hasEnv]); // eslint-disable-line react-hooks/exhaustive-deps
};
