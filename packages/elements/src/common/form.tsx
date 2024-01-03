import type { FormControlProps, FormFieldProps, FormProps } from '@radix-ui/react-form';
import { Control, Field as RadixField, Form as RadixForm, Label, Submit } from '@radix-ui/react-form';
import { createContext, useCallback, useContext, useEffect } from 'react';
import type { FieldDetails } from 'src/internals/machines/sign-in.types';

import {
  fieldHasValueSelector,
  globalErrorSelector,
  useSignInFlow,
  useSignInFlowSelector,
} from '../internals/machines/sign-in.context';

const FieldContext = createContext<Pick<FieldDetails, 'name'> | null>(null);
const useFieldContext = () => useContext(FieldContext);

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
const useForm = () => {
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

const determineInputTypeFromName = (name: string) => {
  if (name === 'password') return 'password' as const;
  if (name === 'email') return 'email' as const;
  if (name === 'phone') return 'tel' as const;

  return 'text' as const;
};

const useInput = ({ name: inputName, value: initialValue }: Partial<Pick<FieldDetails, 'name' | 'value'>>) => {
  // Inputs can be used outside of a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const name = inputName || fieldContext?.name;

  const ref = useSignInFlow();
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(name));

  // Register the field in the machine context
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

  if (!name) {
    throw new Error('Clerk: <Input /> must be wrapped in a <Field> component or have a name prop.');
  }

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;
  const type = determineInputTypeFromName(name);

  return {
    type,
    props: {
      onChange,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      tabIndex: shouldBeHidden ? -1 : 0,
    },
  };
};

function Form({ asChild, ...rest }: FormProps) {
  const form = useForm();

  return (
    <RadixForm
      {...form.props}
      {...rest}
    />
  );
}

function Field({ name, ...rest }: FormFieldProps) {
  return (
    <FieldContext.Provider value={{ name }}>
      <RadixField
        name={name}
        {...rest}
      />
    </FieldContext.Provider>
  );
}

function Input(props: FormControlProps) {
  const { name, value } = props;
  const field = useInput({ name, value });

  return (
    <Control
      type={field.type}
      {...field.props}
      {...props}
    />
  );
}

export { Form, Input, Field, Label, Submit };
