import type { FormControlProps, FormFieldProps, FormLabelProps, FormProps } from '@radix-ui/react-form';
import {
  Control as RadixControl,
  Field as RadixField,
  Form as RadixForm,
  Label as RadixLabel,
  Message as RadixMessage,
  Submit,
} from '@radix-ui/react-form';
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import type { FieldDetails } from 'src/internals/machines/sign-in.types';

import type { ClerkElementsError } from '../internals/errors/error';
import {
  fieldErrorsSelector,
  fieldHasValueSelector,
  globalErrorsSelector,
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

const useField = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const hasValue = useSignInFlowSelector(fieldHasValueSelector(name));
  const error = useSignInFlowSelector(fieldErrorsSelector(name));

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
 * Provides field-error/message-specific props based on the field's type/state
 */
const useFieldErrors = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const errors = useSignInFlowSelector(fieldErrorsSelector(name));

  return {
    errors,
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

function Field(props: FormFieldProps) {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <InnerField {...props} />
    </FieldContext.Provider>
  );
}

function InnerField(props: FormFieldProps) {
  const field = useField({ name: props.name });

  return (
    <RadixField
      {...field.props}
      {...props}
    />
  );
}

function Input(props: FormControlProps) {
  const { name, value } = props;
  const field = useInput({ name, value });

  return (
    <RadixControl
      type={field.type}
      {...field.props}
      {...props}
    />
  );
}

function Label(props: FormLabelProps) {
  return <RadixLabel {...props} />;
}

// ================= ERRORS ================= //
type ClerkElementsErrorsRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;
interface ErrorsProps {
  render(error: ClerkElementsErrorsRenderProps): React.ReactNode;
}

function Errors({ render }: ErrorsProps) {
  const fieldContext = useFieldContext();
  const { errors } = useFieldErrors({ name: fieldContext?.name });

  if (!errors) {
    return null;
  }

  return (
    <>
      {errors.map(error => (
        <RadixMessage
          asChild
          match={error.matchFn}
          forceMatch={error.forceMatch}
          key={`${error.name}-${name}-${error.code}`}
        >
          {render(error)}
        </RadixMessage>
      ))}
    </>
  );
}

export { Field, Form, Input, Errors, Label, Submit };
export type { FormControlProps, FormFieldProps, FormProps, ErrorsProps };
