import { createActorContext } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import type { SnapshotFrom } from 'xstate';

import { SignInMachine } from './sign-in.machine';
import type { FieldDetails } from './sign-in.types';

export const {
  Provider: SignInFlowProvider,
  useActorRef: useSignInFlow,
  useSelector: useSignInFlowSelector,
} = createActorContext(SignInMachine);

// TODO: Move selectors
const fieldHasValueSelector = (type: string | undefined) => (state: SnapshotFrom<typeof SignInMachine>) =>
  type ? Boolean(state.context.fields.get(type)?.value) : false;

const fieldErrorSelector = (type: string | undefined) => (state: SnapshotFrom<typeof SignInMachine>) =>
  type ? Boolean(state.context.fields.get(type)?.error) : undefined;

const globalErrorSelector = (state: SnapshotFrom<typeof SignInMachine>) => state.context.error;

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

export const useInput = ({ type, value: initialValue }: Partial<Pick<FieldDetails, 'type' | 'value'>>) => {
  const ref = useSignInFlow();
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(type));

  useEffect(() => {
    if (!type || ref.getSnapshot().context.fields.get(type)) return;

    ref.send({ type: 'FIELD.ADD', field: { type, value: initialValue } });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { type } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!type) return;
      ref.send({ type: 'FIELD.UPDATE', field: { type, value: event.target.value } });
    },
    [ref, type],
  );

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;

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

export const useForm = () => {
  const ref = useSignInFlow();
  const error = useSignInFlowSelector(globalErrorSelector);

  const validity = error ? 'invalid' : 'valid';

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
