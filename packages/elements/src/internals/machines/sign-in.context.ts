import type { OAuthStrategy, Web3Strategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import { useCallback, useEffect, useMemo } from 'react';
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
const fieldHasValueSelector = (name: string | undefined) => (state: SnapshotState) =>
  name ? Boolean(state.context.fields.get(name)?.value) : false;

/**
 * Selects a field-specific error, if it exists
 */
const fieldErrorSelector = (name: string | undefined) => (state: SnapshotState) =>
  name ? state.context.fields.get(name)?.error : undefined;

/**
 * Selects a global error, if it exists
 */
const globalErrorSelector = (state: SnapshotState) => state.context.error;

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

/**
 * Provides field-specific props based on the field's type/state
 */
export const useField = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(name));
  const error = useSignInFlowSelector(fieldErrorSelector(name));

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
 * Provides control (input)-specific props based on the field/input's type/state
 */
export const useInput = ({ name, value: initialValue }: Partial<Pick<FieldDetails, 'name' | 'value'>>) => {
  const ref = useSignInFlow();
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(name));

  // Add the field to the machine context, ensuring it's only added once
  useEffect(() => {
    if (!name || ref.getSnapshot().context.fields.get(name)) return;

    ref.send({ type: 'FIELD.ADD', field: { name, value: initialValue } });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { name } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!name) return;
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: event.target.value } });
    },
    [ref, name],
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
