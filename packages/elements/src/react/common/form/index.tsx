import { composeEventHandlers } from '@radix-ui/primitive';
import type {
  FormControlProps as RadixFormControlProps,
  FormFieldProps as RadixFormFieldProps,
  FormMessageProps as RadixFormMessageProps,
  FormProps as RadixFormProps,
  FormSubmitProps as RadixFormSubmitProps,
} from '@radix-ui/react-form';
import {
  Control as RadixControl,
  Field as RadixField,
  Form as RadixForm,
  FormMessage as RadixFormMessage,
  Label as RadixLabel,
  Submit as RadixSubmit,
} from '@radix-ui/react-form';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import type { SetRequired, Simplify } from 'type-fest';
import type { BaseActorRef } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors';
import {
  fieldErrorsSelector,
  fieldHasValueSelector,
  fieldValueSelector,
  globalErrorsSelector,
  useFormSelector,
  useFormStore,
} from '~/internals/machines/form/form.context';
import type { FieldDetails } from '~/internals/machines/form/form.types';

import type { OTPInputProps } from './otp';
import { OTPInput } from './otp';
import type { FieldStates } from './types';

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const FieldContext = React.createContext<Pick<FieldDetails, 'name'> | null>(null);
const useFieldContext = () => React.useContext(FieldContext);

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
const useForm = ({ flowActor }: { flowActor?: BaseActorRef<{ type: 'SUBMIT' }> }) => {
  const error = useFormSelector(globalErrorsSelector);
  const validity = error ? 'invalid' : 'valid';

  // Register the onSubmit handler for form submission
  // TODO: merge user-provided submit handler
  const onSubmit = React.useCallback(
    (event: React.FormEvent<Element>) => {
      event.preventDefault();
      if (flowActor) {
        flowActor.send({ type: 'SUBMIT' });
      }
    },
    [flowActor],
  );

  return {
    props: {
      [`data-${validity}`]: true,
      onSubmit,
    },
  };
};

const useField = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const hasValue = useFormSelector(fieldHasValueSelector(name));
  const error = useFormSelector(fieldErrorsSelector(name));

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

const useGlobalErrors = () => {
  const errors = useFormSelector(globalErrorsSelector);

  return {
    errors,
  };
};

/**
 * Provides field-error/message-specific props based on the field's type/state
 */
const useFieldErrors = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const errors = useFormSelector(fieldErrorsSelector(name));

  return {
    errors,
  };
};

const determineInputTypeFromName = (name: string) => {
  if (name === 'password') return 'password' as const;
  if (name === 'email') return 'email' as const;
  if (name === 'phone') return 'tel' as const;
  if (name === 'code') return 'otp' as const;

  return 'text' as const;
};

const useInput = ({ name: inputName, value: initialValue, type: inputType, ...passthroughProps }: FormInputProps) => {
  // Inputs can be used outside of a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const name = inputName || fieldContext?.name;
  const onChangeProp = passthroughProps?.onChange;

  const ref = useFormStore();
  const value = useFormSelector(fieldValueSelector(name));
  const hasValue = Boolean(value);

  // Register the field in the machine context
  React.useEffect(() => {
    if (!name || ref.getSnapshot().context.fields.get(name)) return;

    ref.send({ type: 'FIELD.ADD', field: { name, value: initialValue } });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { name } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (!name) return;
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: event.target.value } });
    },
    [ref, name, onChangeProp],
  );

  if (!name) {
    throw new Error('Clerk: <Input /> must be wrapped in a <Field> component or have a name prop.');
  }

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;
  const type = inputType ?? determineInputTypeFromName(name);

  const Element = type === 'otp' ? OTPInput : RadixControl;

  let props = {};
  if (inputType === 'otp') {
    props = {
      'data-otp-input': true,
      autoComplete: 'one-time-code',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 6,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        // Only accept numbers
        event.currentTarget.value = event.currentTarget.value.replace(/\D+/g, '');
        onChange(event);
      },
    };
  }

  return {
    Element,
    props: {
      type,
      value: value ?? '',
      onChange,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      tabIndex: shouldBeHidden ? -1 : 0,
      ...props,
      ...passthroughProps,
    },
  };
};

/* -------------------------------------------------------------------------------------------------
 * Form
 * -----------------------------------------------------------------------------------------------*/

const FORM_NAME = 'ClerkElementsForm';

type FormElement = React.ElementRef<typeof RadixForm>;
type FormProps = SetRequired<RadixFormProps, 'children'> & {
  flowActor?: BaseActorRef<{ type: 'SUBMIT' }>;
};

const Form = React.forwardRef<FormElement, FormProps>(({ flowActor, onSubmit, ...rest }, forwardedRef) => {
  const form = useForm({ flowActor: flowActor });

  const { onSubmit: internalOnSubmit, ...internalFormProps } = form.props;

  return (
    <RadixForm
      {...internalFormProps}
      {...rest}
      onSubmit={composeEventHandlers(internalOnSubmit, onSubmit)}
      ref={forwardedRef}
    />
  );
});

Form.displayName = FORM_NAME;

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

const FIELD_NAME = 'ClerkElementsField';
const FIELD_INNER_NAME = 'ClerkElementsFieldInner';

type FormFieldElement = React.ElementRef<typeof RadixField>;
type FormFieldProps = RadixFormFieldProps;

/**
 * A wrapper component used to associate its child elements with a specific form field. Automatically handles unique ID generation and associating labels with inputs.
 *
 * @param name - Give your `<Field>` a unique name inside the current form. If you choose one of the following names Clerk Elements will automatically set the correct type on the `<input />` element: `email`, `password`, `phone`, `code`, and `identifier`.
 *
 * @example
 * export default Component = () => (
 *  <Field name="email">
 *    <Label>Email</Label>
 *    <Input />
 *  </Field>
 * )
 */
const Field = React.forwardRef<FormFieldElement, FormFieldProps>((props, forwardedRef) => {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <FieldInner
        {...props}
        ref={forwardedRef}
      />
    </FieldContext.Provider>
  );
});

const FieldInner = React.forwardRef<FormFieldElement, FormFieldProps>((props, forwardedRef) => {
  const field = useField({ name: props.name });

  return (
    <RadixField
      {...field.props}
      {...props}
      ref={forwardedRef}
    />
  );
});

Field.displayName = FIELD_NAME;
FieldInner.displayName = FIELD_INNER_NAME;

/**
 * Programmatically access the state of the wrapping `<Field>`. Useful for implementing animations when direct access to the value is necessary.
 * @param {Function} children - A render prop function that receives `state` as an argument. `state` will be either `'valid'` or `'invalid'`.
 *
 * @example
 * export default Component = () => (
 * <Field name="email">
 *  <FieldState>
 *    {({ state }) => (
 *      <pre>Field state: {state}</pre>
 *    )}
 *  </FieldState>
 * </Field>
 */
function FieldState({ children }: { children: (state: { state: FieldStates }) => React.ReactNode }) {
  const field = useFieldContext();
  const error = useFormSelector(fieldErrorsSelector(field?.name));
  const state = error ? ('invalid' as const) : ('valid' as const);

  const fieldState = { state };

  return children(fieldState);
}

/* -------------------------------------------------------------------------------------------------
 * Input
 * -----------------------------------------------------------------------------------------------*/

const INPUT_NAME = 'ClerkElementsLabel';

type FormInputProps = RadixFormControlProps | ({ type: 'otp' } & OTPInputProps);

const Input = (props: FormInputProps) => {
  const field = useInput(props);
  return <field.Element {...field.props} />;
};

Input.displayName = INPUT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Label
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'ClerkElementsLabel';

const Label = RadixLabel;

Label.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * Submit
 * -----------------------------------------------------------------------------------------------*/

const SUBMIT_NAME = 'ClerkElementsSubmit';

type FormSubmitProps = SetRequired<RadixFormSubmitProps, 'children'>;
type FormSubmitComponent = React.ForwardRefExoticComponent<FormSubmitProps & React.RefAttributes<HTMLButtonElement>>;

const Submit = RadixSubmit as FormSubmitComponent;

Submit.displayName = SUBMIT_NAME;

/* -------------------------------------------------------------------------------------------------
 * GlobalError & FieldError
 * -----------------------------------------------------------------------------------------------*/

const GLOBAL_ERROR_NAME = 'ClerkElementsGlobalError';
const FIELD_ERROR_NAME = 'ClerkElementsFieldError';

type FormErrorRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;

type FormErrorPropsRenderFn = {
  asChild?: never;
  children?: (error: FormErrorRenderProps) => React.ReactNode;
  code?: string;
};

type FormErrorPropsStd = {
  asChild?: false;
  children: React.ReactNode;
  code: string;
};

type FormErrorPropsAsChild = {
  asChild?: true;
  children: React.ReactElement;
  code: string;
};

type FormErrorProps<T> = Simplify<
  Omit<T, 'asChild' | 'children'> & (FormErrorPropsRenderFn | FormErrorPropsStd | FormErrorPropsAsChild)
>;

type FormGlobalErrorElement = React.ElementRef<'div'>;
type FormGlobalErrorProps = FormErrorProps<React.ComponentPropsWithoutRef<'div'>>;
type FormFieldErrorElement = React.ElementRef<typeof RadixFormMessage>;
type FormFieldErrorProps = FormErrorProps<RadixFormMessageProps & { name?: string }>;

/**
 * Renders errors that are returned from Clerk's API but are not associated with a specific field. By default, it will render the error's message wrapped in an unstyled `<div>` element. **Must** be placed inside components like `<SignIn>` or `<SignUp>` to work correctly.
 * @param {string} [code] - Forces the message with the matching code to be shown. This is useful when using server-side validation.
 * @param {Function} [children] - A render prop function that receives `message` and `code` as arguments.
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * export default Component = () => (
 *  <SignIn>
 *    <GlobalError />
 *  </SignIn>
 * )
 * @example
 * export default Component = () => (
 *  <SignUp>
 *    <GlobalError>
 *      {({ message, code }) => (
 *        <span data-error-code={code}>{message}</span>
 *      )}
 *    </GlobalError>
 *  </SignUp>
 * )
 */
const GlobalError = React.forwardRef<FormGlobalErrorElement, FormGlobalErrorProps>(
  ({ asChild = false, children, code, ...rest }, forwardedRef) => {
    const { errors } = useGlobalErrors();

    const error = errors?.[0];

    if (!error || (code && error.code !== code)) {
      return null;
    }

    const Comp = asChild ? Slot : 'div';
    const child = typeof children === 'function' ? children(error) : children;

    return (
      <Comp
        role='alert'
        {...rest}
        ref={forwardedRef}
      >
        {child || error.message}
      </Comp>
    );
  },
);

/**
 * Renders error messages associated with the parent `<Field>` component. By default, it will render the error message wrapped in an unstyled `<span>` element.
 * @param {string} [name] - Used to target a specific field by name when rendering outside of a `<Field>` part.
 * @param {string} [code] - Forces the message with the matching code to be shown. This is useful when using server-side validation.
 * @param {Function} [children] - A render prop function that receives `message` and `code` as arguments.
 *
 * @example
 * export default Component = () => (
 *  <Field name="email">
 *    <FieldError />
 *  </Field>
 * )
 *
 * @example
 * export default Component = () => (
 *  <Field name="email">
 *    <FieldError>
 *      {({ message, code }) => (
 *        <span data-error-code={code}>{message}</span>
 *      )}
 *    </FieldError>
 *  </Field>
 * )
 */
const FieldError = React.forwardRef<FormFieldErrorElement, FormFieldErrorProps>(
  ({ children, code, name, ...rest }, forwardedRef) => {
    const fieldContext = useFieldContext();
    const fieldName = fieldContext?.name || name;
    const { errors } = useFieldErrors({ name: fieldName });

    const error = errors?.[0];

    if (!error) {
      return null;
    }

    const child = typeof children === 'function' ? children(error) : children;
    const forceMatch = code ? error.code === code : true;

    return (
      <RadixFormMessage
        data-error-code={error.code}
        forceMatch={forceMatch}
        {...rest}
        ref={forwardedRef}
      >
        {child || error.message}
      </RadixFormMessage>
    );
  },
);

GlobalError.displayName = GLOBAL_ERROR_NAME;
FieldError.displayName = FIELD_ERROR_NAME;

export { Field, FieldError, FieldState, Form, GlobalError, Input, Label, Submit };
export type {
  RadixFormControlProps as FormControlProps,
  FormFieldErrorProps,
  FormErrorProps,
  FormErrorRenderProps,
  FormFieldProps,
  FormGlobalErrorProps,
  FormInputProps,
  FormProps,
  FormSubmitProps,
};
