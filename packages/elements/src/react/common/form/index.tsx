import type {
  FormControlProps,
  FormFieldProps,
  FormLabelProps,
  FormMessageProps,
  FormProps,
} from '@radix-ui/react-form';
import {
  Control as RadixControl,
  Field as RadixField,
  Form as RadixForm,
  FormMessage,
  Label as RadixLabel,
  Submit,
} from '@radix-ui/react-form';
import type { ComponentProps, CSSProperties, HTMLProps, ReactNode } from 'react';
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type { BaseActorRef } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors/error';
import {
  fieldErrorsSelector,
  fieldHasValueSelector,
  fieldValueSelector,
  globalErrorsSelector,
  useFormSelector,
  useFormStore,
} from '~/internals/machines/form/form.context';
import type { FieldDetails } from '~/internals/machines/form/form.types';

import type { ClerkInputType, FieldStates } from './types';

const FieldContext = createContext<Pick<FieldDetails, 'name'> | null>(null);
const useFieldContext = () => useContext(FieldContext);

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
const useForm = ({ flowActor }: { flowActor?: BaseActorRef<{ type: 'SUBMIT' }> }) => {
  const error = useFormSelector(globalErrorsSelector);
  const validity = error ? 'invalid' : 'valid';

  // Register the onSubmit handler for form submission
  // TODO: merge user-provided submit handler
  const onSubmit = useCallback(
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

const useInput = ({
  name: inputName,
  value: initialValue,
  type: inputType,
}: Partial<Pick<FieldDetails, 'name' | 'value'> & { type: ClerkInputType }>) => {
  // Inputs can be used outside of a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const name = inputName || fieldContext?.name;

  const ref = useFormStore();
  const value = useFormSelector(fieldValueSelector(name));
  const hasValue = Boolean(value);

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
  const type = inputType ?? determineInputTypeFromName(name);

  return {
    type,
    props: {
      value: value ?? '',
      onChange,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      tabIndex: shouldBeHidden ? -1 : 0,
    },
  };
};

function Form({ flowActor, ...props }: { flowActor?: BaseActorRef<{ type: 'SUBMIT' }> } & FormProps) {
  const form = useForm({ flowActor: flowActor });

  return (
    <RadixForm
      {...form.props}
      {...props}
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

/**
 * A helper to access the state of the field programmatically. This can be useful if you need to trigger
 * animations or certain behavior based on the field's state independent of the existing components.
 */
function FieldState({ children }: { children: (state: { state: FieldStates }) => ReactNode }) {
  const field = useFieldContext();
  const error = useFormSelector(fieldErrorsSelector(field?.name));
  const state = error ? ('invalid' as const) : ('valid' as const);

  const fieldState = { state };

  return children(fieldState);
}

type ClerkInputProps = FormControlProps | ({ type: 'otp' } & OTPInputProps);

function Input(props: ClerkInputProps) {
  const { name, value, type, ...passthroughProps } = props;
  const field = useInput({ name, value, type });

  let propsForType = {};
  if (field.type === 'otp') {
    propsForType = {
      type: 'text',
      asChild: true,
      // @ts-expect-error -- render is passed opaquely by RadixControl
      children: <OTPInput />,
    };
  }

  return (
    <RadixControl
      type={field.type}
      {...field.props}
      {...(passthroughProps as FormControlProps)}
      {...propsForType}
    />
  );
}

type OTPInputProps = Exclude<
  HTMLProps<HTMLInputElement>,
  'type' | 'autoComplete' | 'maxLength' | 'inputMode' | 'pattern'
> & { render: (props: { value: string; status: 'cursor' | 'selected' | 'none'; index: number }) => ReactNode };

/**
 * A custom input component to handle accepting OTP codes. An invisible input element is used to capture input and handle native input
 * interactions, while the provided render prop is used to visually render the input's contents.
 */
const OTPInput = forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(props, ref) {
  const length = 6;
  const { className, render, ...rest } = props;

  const innerRef = useRef<HTMLInputElement>(null);
  const [selectionRange, setSelectionRange] = React.useState<[number, number]>([0, 0]);

  // This ensures we can access innerRef internally while still exposing it via the ref prop
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

  // A layout effect is used here to avoid any perceived visual lag when changing the selection
  useLayoutEffect(() => {
    setSelectionRange(cur => {
      const updated: [number, number] = [innerRef.current?.selectionStart ?? 0, innerRef.current?.selectionEnd ?? 0];

      // When navigating backwards, ensure we select the previous character instead of only moving the cursor
      if (updated[0] === cur[0] && updated[1] < cur[1]) {
        updated[0] = updated[0] - 1;
      }

      // Only update the selection if it has changed to avoid unnecessary updates
      if (updated[0] !== cur[0] || updated[1] !== cur[1]) {
        innerRef.current?.setSelectionRange(updated[0], updated[1]);
        return updated;
      }

      return cur;
    });
  }, [props.value]);

  return (
    <div
      style={
        {
          position: 'relative',
        } as CSSProperties
      }
    >
      {/* We can't target pseud-elements with the style prop, so we inject a tag here */}
      <style>{`
      input[data-otp-input]::selection {
        color: transparent;
        background-color: none;
      }
      `}</style>
      <input
        data-otp-input
        ref={innerRef}
        type='text'
        autoComplete='one-time-code'
        maxLength={length}
        inputMode='numeric'
        pattern='[0-9]*'
        {...rest}
        onChange={event => {
          // Only accept numbers
          event.currentTarget.value = event.currentTarget.value.replace(/\D+/g, '');

          rest?.onChange?.(event);
        }}
        onSelect={() => {
          setSelectionRange(cur => {
            let direction: 'forward' | 'backward' = 'forward' as const;
            let updated: [number, number] = [
              innerRef.current?.selectionStart ?? 0,
              innerRef.current?.selectionEnd ?? 0,
            ];

            // Abort unnecessary updates
            if (cur[0] === updated[0] && cur[1] === updated[1]) {
              return cur;
            }

            // When moving the selection, we want to select either the previous or next character instead of only moving the cursor.
            // If the start and end indices are the same, it means only the cursor has moved and we need to make a decision on which character to select.
            if (updated[0] === updated[1]) {
              if (updated[0] > 0 && cur[0] === updated[0] && cur[1] === updated[0] + 1) {
                direction = 'backward' as const;
                updated = [updated[0] - 1, updated[1]];
              } else if (typeof innerRef.current?.value[updated[0]] !== 'undefined') {
                updated = [updated[0], updated[1] + 1];
              }
            }

            innerRef.current?.setSelectionRange(updated[0], updated[1], direction);

            return updated;
          });
        }}
        style={{
          display: 'block',
          // Attempt to add some padding to let autocomplete overlays show without overlap
          width: '110%',
          height: '100%',
          background: 'none',
          outline: 'none',
          appearance: 'none',
          color: 'transparent',
          inset: 0,
          position: 'absolute',
        }}
      />
      <div
        className={className}
        aria-hidden
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1em',
          zIndex: 1,
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length }).map((_, i) =>
          render({
            value: String(props.value)[i] || '',
            status:
              selectionRange[0] === selectionRange[1] && selectionRange[0] === i
                ? 'cursor'
                : selectionRange[0] <= i && selectionRange[1] > i
                ? 'selected'
                : 'none',
            index: i,
          }),
        )}
      </div>
    </div>
  );
});

function Label(props: FormLabelProps) {
  return <RadixLabel {...props} />;
}

// ================= ERRORS ================= //

type ClerkElementsErrorsRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;
type ClerkErrorChildrenFn = ((error: ClerkElementsErrorsRenderProps) => React.ReactNode) | React.ReactNode;
type ClerkErrorProps = ClerkGlobalErrorProps | ClerkFieldErrorProps;

type ClerkGlobalErrorProps = Omit<ComponentProps<'span'>, 'children'> &
  (
    | {
        children?: ClerkErrorChildrenFn;
        code?: string;
        name?: never;
      }
    | {
        children: React.ReactNode;
        code: string;
        name?: never;
      }
  );

type ClerkFieldErrorProps = Omit<FormMessageProps, 'asChild' | 'children'> &
  (
    | {
        children?: ClerkErrorChildrenFn;
        code?: string;
        name: string;
      }
    | {
        children: React.ReactNode;
        code: string;
        name: string;
      }
  );

/**
 * Component used to render:
 *  1. field-level errors when render within a <Field> or with a `name` prop
 *  2. global errors when rendered outside of a <Field> and without a `name` prop
 */

function ClerkError({ name, ...rest }: ClerkErrorProps) {
  const fieldContext = useFieldContext();
  const fieldName = name || fieldContext?.name;

  if (fieldName) {
    return (
      <FieldError
        name={fieldName}
        {...rest}
      />
    );
  }

  return <GlobalError {...rest} />;
}

function GlobalError({ children, code, ...rest }: ClerkGlobalErrorProps) {
  const { errors } = useGlobalErrors();

  const error = errors?.[0];

  if (!error || error.code !== code) {
    return null;
  }

  const child = typeof children === 'function' ? children(error) : children;

  return (
    <span
      role='alert'
      {...rest}
    >
      {child || error.message}
    </span>
  );
}

function FieldError({ children, code, name, ...rest }: ClerkFieldErrorProps) {
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
    <FormMessage
      data-error-code={error.code}
      forceMatch={forceMatch}
      {...rest}
    >
      {child || error.message}
    </FormMessage>
  );
}

export { Field, FieldState, Form, Input, ClerkError, Label, Submit };
export type { FormControlProps, FormFieldProps, FormProps, ClerkErrorProps };
