import { useClerk } from '@clerk/clerk-react';
import { logger } from '@clerk/shared/logger';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { Autocomplete } from '@clerk/types';
import { composeEventHandlers } from '@radix-ui/primitive';
import type {
  FormControlProps,
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
  ValidityState as RadixValidityState,
} from '@radix-ui/react-form';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import type { SetRequired } from 'type-fest';
import type { BaseActorRef } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors';
import { ClerkElementsFieldError, ClerkElementsRuntimeError } from '~/internals/errors';
import type { FieldDetails } from '~/internals/machines/form';
import {
  fieldFeedbackSelector,
  fieldHasValueSelector,
  fieldValueSelector,
  globalErrorsSelector,
  useFormSelector,
  useFormStore,
} from '~/internals/machines/form/form.context';
import { usePassword } from '~/react/hooks/use-password.hook';
import { SignInRouterCtx } from '~/react/sign-in/context';
import { useSignInPasskeyAutofill } from '~/react/sign-in/context/router.context';
import type { ErrorCodeOrTuple } from '~/react/utils/generate-password-error-text';
import { isReactFragment } from '~/react/utils/is-react-fragment';

import type { OTPInputProps } from './otp';
import { OTP_LENGTH_DEFAULT, OTPInput } from './otp';
import { type ClerkFieldId, FIELD_STATES, type FieldStates } from './types';

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const FieldContext = React.createContext<Pick<FieldDetails, 'name'> | null>(null);
const useFieldContext = () => React.useContext(FieldContext);

const ValidityStateContext = React.createContext<ValidityState | undefined>(undefined);
const useValidityStateContext = () => React.useContext(ValidityStateContext);

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

const determineInputTypeFromName = (name: FormFieldProps['name']) => {
  if (name === 'password' || name === 'confirmPassword' || name === 'currentPassword' || name === 'newPassword') {
    return 'password' as const;
  }
  if (name === 'emailAddress') {
    return 'email' as const;
  }
  if (name === 'phoneNumber') {
    return 'tel' as const;
  }
  if (name === 'code') {
    return 'otp' as const;
  }
  if (name === 'backup_code') {
    return 'backup_code' as const;
  }

  return 'text' as const;
};

/**
 * Radix can return the ValidityState object, which contains the validity of the field. We need to merge this with our existing fieldState.
 * When the ValidityState is valid: false, the fieldState should be overriden. Otherwise, it shouldn't change at all.
 * @see https://www.radix-ui.com/primitives/docs/components/form#validitystate
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
 */
const enrichFieldState = (validity: ValidityState | undefined, fieldState: FieldStates) => {
  return validity?.valid === false ? FIELD_STATES.error : fieldState;
};

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

const useGlobalErrors = () => {
  const errors = useFormSelector(globalErrorsSelector);

  return {
    errors,
  };
};

const useFieldFeedback = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const feedback = useFormSelector(fieldFeedbackSelector(name));

  return {
    feedback,
  };
};

/**
 * Given a field name, determine the current state of the field
 */
const useFieldState = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const { feedback } = useFieldFeedback({ name });
  const hasValue = useFormSelector(fieldHasValueSelector(name));

  /**
   * If hasValue is false, the state should be idle
   * The rest depends on the feedback type
   */
  let state: FieldStates = FIELD_STATES.idle;

  if (!hasValue) {
    state = FIELD_STATES.idle;
  }

  switch (feedback?.type) {
    case 'error':
      state = FIELD_STATES.error;
      break;
    case 'warning':
      state = FIELD_STATES.warning;
      break;
    case 'info':
      state = FIELD_STATES.info;
      break;
    case 'success':
      state = FIELD_STATES.success;
      break;
    default:
      break;
  }

  return {
    state,
  };
};

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
const useForm = ({ flowActor }: { flowActor?: BaseActorRef<{ type: 'SUBMIT' }> }) => {
  const { errors } = useGlobalErrors();

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
      ...(errors.length > 0 ? { 'data-global-error': true } : {}),
      onSubmit,
    },
  };
};

const useField = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const hasValue = useFormSelector(fieldHasValueSelector(name));
  const { feedback } = useFieldFeedback({ name });

  const shouldBeHidden = false; // TODO: Implement clerk-js utils
  const hasError = feedback ? feedback.type === 'error' : false;

  return {
    hasValue,
    props: {
      'data-hidden': shouldBeHidden ? true : undefined,
      serverInvalid: hasError,
    },
  };
};

const useInput = ({
  name: inputName,
  value: providedValue,
  checked: providedChecked,
  type: inputType,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  ...passthroughProps
}: FormInputProps) => {
  // Inputs can be used outside a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const rawName = inputName || fieldContext?.name;
  const name = rawName === 'backup_code' ? 'code' : rawName; // `backup_code` is a special case of `code`
  const { state: fieldState } = useFieldState({ name });
  const validity = useValidityStateContext();

  if (!rawName || !name) {
    throw new Error('Clerk: <Input /> must be wrapped in a <Field> component or have a name prop.');
  }

  const ref = useFormStore();
  const [hasPassedValiation, setHasPassedValidation] = React.useState(false);

  const { validatePassword } = usePassword({
    onValidationComplexity: hasPassed => setHasPassedValidation(hasPassed),
    onValidationSuccess: () => {
      ref.send({
        type: 'FIELD.FEEDBACK.SET',
        field: { name, feedback: { type: 'success', message: 'Your password meets all the necessary requirements.' } },
      });
    },
    onValidationError: (error, codes) => {
      if (error) {
        ref.send({
          type: 'FIELD.FEEDBACK.SET',
          field: {
            name,
            feedback: {
              type: 'error',
              message: new ClerkElementsFieldError('password-validation-error', error),
              codes,
            },
          },
        });
      }
    },
    onValidationWarning: (warning, codes) =>
      ref.send({
        type: 'FIELD.FEEDBACK.SET',
        field: { name, feedback: { type: 'warning', message: warning, codes } },
      }),
    onValidationInfo: (info, codes) => {
      // TODO: If input is not focused, make this info an error
      ref.send({
        type: 'FIELD.FEEDBACK.SET',
        field: {
          name,
          feedback: {
            type: 'info',
            message: info,
            codes,
          },
        },
      });
    },
  });
  const value = useFormSelector(fieldValueSelector(name));
  const prevValue = usePrevious(value);
  const hasValue = Boolean(value);
  const type = inputType ?? determineInputTypeFromName(rawName);
  let nativeFieldType = type;
  let shouldValidatePassword = false;

  if (type === 'password' || type === 'text') {
    shouldValidatePassword = Boolean((passthroughProps as PasswordInputProps).validatePassword);
  }

  if (nativeFieldType === 'otp' || nativeFieldType === 'backup_code') {
    nativeFieldType = 'text';
  }

  // Register the field in the machine context
  React.useEffect(() => {
    if (!name) {
      return;
    }

    ref.send({
      type: 'FIELD.ADD',
      field: { name, type: nativeFieldType, value: providedValue, checked: providedChecked },
    });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { name } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (!name) {
        return;
      }
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: event.target.value, checked: event.target.checked } });
      if (shouldValidatePassword) {
        validatePassword(event.target.value);
      }
    },
    [ref, name, onChangeProp, shouldValidatePassword, validatePassword],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      if (shouldValidatePassword && event.target.value !== prevValue) {
        validatePassword(event.target.value);
      }
    },
    [onBlurProp, shouldValidatePassword, validatePassword, prevValue],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(event);
      if (shouldValidatePassword && event.target.value !== prevValue) {
        validatePassword(event.target.value);
      }
    },
    [onFocusProp, shouldValidatePassword, validatePassword, prevValue],
  );

  React.useEffect(() => {
    if (!name) {
      return;
    }

    if (
      (type === 'checkbox' && providedChecked !== undefined) ||
      (type !== 'checkbox' && providedValue !== undefined)
    ) {
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: providedValue, checked: providedChecked } });
    }
  }, [name, type, ref, providedValue, providedChecked]);

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;

  const Element = type === 'otp' ? OTPInput : RadixControl;

  let props = {};
  if (type === 'otp') {
    const p = passthroughProps as Omit<OTPInputProps, 'name' | 'value' | 'type'>;
    const length = p.length || OTP_LENGTH_DEFAULT;

    props = {
      'data-otp-input': true,
      autoComplete: 'one-time-code',
      inputMode: 'numeric',
      pattern: `[0-9]{${length}}`,
      minLength: length,
      maxLength: length,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        // Only accept numbers
        event.currentTarget.value = event.currentTarget.value.replace(/\D+/g, '');
        onChange(event);
      },
      type: 'text',
      spellCheck: false,
    };
  } else if (type === 'backup_code') {
    props = {
      autoComplete: 'off',
      type: 'text',
      spellCheck: false,
    };
  } else if (type === 'password' && shouldValidatePassword) {
    props = {
      'data-has-passed-validation': hasPassedValiation ? true : undefined,
    };
  }

  // Filter out invalid props that should not be passed through
  // @ts-expect-error - Doesn't know about type narrowing by type here
  const { validatePassword: _1, ...rest } = passthroughProps;

  return {
    Element,
    props: {
      type,
      value: value ?? '',
      onChange,
      onBlur,
      onFocus,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      'data-state': enrichFieldState(validity, fieldState),
      ...props,
      ...rest,
    },
  };
};

/* -------------------------------------------------------------------------------------------------
 * Form
 * -----------------------------------------------------------------------------------------------*/

const FORM_NAME = 'ClerkElementsForm';

type FormElement = React.ElementRef<typeof RadixForm>;
type FormProps = Omit<RadixFormProps, 'children'> & {
  children: React.ReactNode;
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
const FIELD_STATE_NAME = 'ClerkElementsFieldState';

type FormFieldElement = React.ElementRef<typeof RadixField>;
type FormFieldProps = Omit<RadixFormFieldProps, 'children'> & {
  name: Autocomplete<ClerkFieldId>;
  alwaysShow?: boolean;
  children: React.ReactNode | ((state: FieldStates) => React.ReactNode);
};

/**
 * Field is used to associate its child elements with a specific input. It automatically handles unique ID generation and associating the contained label and input elements.
 *
 * @param name - Give your `<Field>` a unique name inside the current form. If you choose one of the following names Clerk Elements will automatically set the correct type on the `<input />` element: `emailAddress`, `password`, `phoneNumber`, and `code`.
 * @param alwaysShow - Optional. When `true`, the field will always be rendered, regardless of its state. By default, a field is hidden if it's optional or if it's a filled-out required field.
 * @param {Function} children - A function that receives `state` as an argument. `state` is a union of `"success" | "error" | "idle" | "warning" | "info"`.
 *
 * @example
 * <Clerk.Field name="emailAddress">
 *   <Clerk.Label>Email</Clerk.Label>
 *   <Clerk.Input />
 * </Clerk.Field>
 *
 * @example
 * <Clerk.Field name="emailAddress">
 *  {(fieldState) => (
 *    <Clerk.Label>Email</Clerk.Label>
 *    <Clerk.Input className={`text-${fieldState}`} />
 *  )}
 * </Clerk.Field>
 */
const Field = React.forwardRef<FormFieldElement, FormFieldProps>(({ alwaysShow, ...rest }, forwardedRef) => {
  const formRef = useFormStore();
  const formCtx = formRef.getSnapshot().context;
  // A field is marked as hidden if it's optional OR if it's a filled-out required field
  const isHiddenField = formCtx.progressive && Boolean(formCtx.hidden?.has(rest.name));

  // Only alwaysShow={true} should force behavior to render the field, on `undefined` or alwaysShow={false} the isHiddenField logic should take over
  const shouldHide = alwaysShow ? false : isHiddenField;

  return shouldHide ? null : (
    <FieldContext.Provider value={{ name: rest.name }}>
      <FieldInner
        {...rest}
        ref={forwardedRef}
      />
    </FieldContext.Provider>
  );
});

const FieldInner = React.forwardRef<FormFieldElement, FormFieldProps>((props, forwardedRef) => {
  const { children, ...rest } = props;
  const field = useField({ name: rest.name });
  const { state: fieldState } = useFieldState({ name: rest.name });

  return (
    <RadixField
      {...field.props}
      {...rest}
      ref={forwardedRef}
    >
      <RadixValidityState>
        {validity => {
          const enrichedFieldState = enrichFieldState(validity, fieldState);

          return (
            <ValidityStateContext.Provider value={validity}>
              {typeof children === 'function' ? children(enrichedFieldState) : children}
            </ValidityStateContext.Provider>
          );
        }}
      </RadixValidityState>
    </RadixField>
  );
});

Field.displayName = FIELD_NAME;
FieldInner.displayName = FIELD_INNER_NAME;

type FieldStateRenderFn = {
  children: (state: {
    state: FieldStates;
    message: string | undefined;
    codes: ErrorCodeOrTuple[] | undefined;
  }) => React.ReactNode;
};

/**
 * Programmatically access the state of the wrapping `<Field>`. Useful for implementing animations when direct access to the state value is necessary.
 *
 * @param {Function} children - A function that receives `state`, `message`, and `codes` as an argument. `state` will is a union of `"success" | "error" | "idle" | "warning" | "info"`. `message` will be the corresponding message, e.g. error message. `codes` will be an array of keys that were used to generate the password validation messages. This prop is only available when the field is of type `password` and has `validatePassword` set to `true`.
 *
 * @example
 *
 * <Clerk.Field name="email">
 *  <Clerk.Label>Email</Clerk.Label>
 *  <Clerk.FieldState>
 *    {({ state }) => (
 *      <Clerk.Input className={`text-${state}`} />
 *    )}
 *  </Clerk.FieldState>
 * </Clerk.Field>
 *
 * @example
 * <Clerk.Field name="password">
 *  <Clerk.Label>Password</Clerk.Label>
 *  <Clerk.Input validatePassword />
 *  <Clerk.FieldState>
 *    {({ state, message, codes }) => (
 *      <pre>Field state: {state}</pre>
 *      <pre>Field msg: {message}</pre>
 *      <pre>Pwd keys: {codes.join(', ')}</pre>
 *    )}
 *  </Clerk.FieldState>
 * </Clerk.Field>
 */
function FieldState({ children }: FieldStateRenderFn) {
  const field = useFieldContext();
  const { feedback } = useFieldFeedback({ name: field?.name });
  const { state } = useFieldState({ name: field?.name });
  const validity = useValidityStateContext();

  const message = feedback?.message instanceof ClerkElementsFieldError ? feedback.message.message : feedback?.message;
  const codes = feedback?.codes;

  const fieldState = { state: enrichFieldState(validity, state), message, codes };

  return children(fieldState);
}

FieldState.displayName = FIELD_STATE_NAME;

/* -------------------------------------------------------------------------------------------------
 * Input
 * -----------------------------------------------------------------------------------------------*/

const INPUT_NAME = 'ClerkElementsInput';

type PasswordInputProps = Exclude<FormControlProps, 'type'> & {
  validatePassword?: boolean;
};

type FormInputProps =
  | RadixFormControlProps
  | ({ type: 'otp'; render: OTPInputProps['render'] } & Omit<OTPInputProps, 'asChild'>)
  | ({ type: 'otp'; render?: undefined } & OTPInputProps)
  // Usecase: Toggle the visibility of the password input, therefore 'password' and 'text' are allowed
  | ({ type: 'password' | 'text' } & PasswordInputProps);

/**
 * Handles rendering of `<input>` elements within Clerk's flows. Supports special `type` prop values to render input types that are unique to authentication and user management flows. Additional props will be passed through to the `<input>` element.
 *
 * @param {boolean} [asChild] - If true, `<Input />` will render as its child element, passing along any necessary props.
 * @param {string} [name] - Used to target a specific field by name when rendering outside of a `<Field>` component.
 *
 * @example
 * <Clerk.Field name="identifier">
 *   <Clerk.Label>Email</Clerk.Label>
 *   <Clerk.Input type="email" autoComplete="email" className="emailInput" />
 * </Clerk.Field>
 *
 * @param {Number} [length] - The length of the OTP input. Defaults to 6.
 * @param {Number} [passwordManagerOffset] - Password managers place their icon inside an `<input />`. This default behaviour is not desirable when you use the render prop to display N distinct element. With this prop you can increase the width of the `<input />` so that the icon is rendered outside the OTP inputs.
 * @param {string} [type] - Type of control to render. Supports a special `'otp'` type for one-time password inputs. If the wrapping `<Field>` component has `name='code'`, the type will default to `'otp'`. With the `'otp'` type, the input will have a pattern and length set to 6 by default and render a single `<input />` element.
 *
 * @example
 * <Clerk.Field name="code">
 *   <Clerk.Label>Email code</Clerk.Label>
 *   <Clerk.Input type="otp" />
 * </Clerk.Field>
 *
 * @param {Function} [render] - Optionally, you can use a render prop that controls how each individual character is rendered. If no `render` prop is provided, a single text `<input />` will be rendered.
 *
 * @example
 * <Clerk.Field name="code">
 *   <Clerk.Label>Email code</Clerk.Label>
 *   <Clerk.Input
 *     type="otp"
 *     render={({ value, status }) => <span data-status={status}>{value}</span>}
 *   />
 * </Clerk.Field>
 */
const Input = React.forwardRef<React.ElementRef<typeof RadixControl>, FormInputProps>(
  (props: FormInputProps, forwardedRef) => {
    const clerk = useClerk();
    const field = useInput(props);

    const hasPasskeyAutofillProp = Boolean(field.props.autoComplete?.includes('webauthn'));
    const allowedTypeForPasskey = (['text', 'email', 'tel'] as FormInputProps['type'][]).includes(field.props.type);
    const signInRouterRef = SignInRouterCtx.useActorRef(true);

    clerk.telemetry?.record(
      eventComponentMounted('Elements_Input', {
        type: props.type ?? false,
        // @ts-expect-error - Depending on type the props can be different
        render: Boolean(props?.render),
        // @ts-expect-error - Depending on type the props can be different
        asChild: Boolean(props?.asChild),
        // @ts-expect-error - Depending on type the props can be different
        validatePassword: Boolean(props?.validatePassword),
      }),
    );

    if (signInRouterRef && hasPasskeyAutofillProp && allowedTypeForPasskey) {
      return (
        <InputWithPasskeyAutofill
          ref={forwardedRef}
          {...props}
        />
      );
    }

    if (hasPasskeyAutofillProp && !allowedTypeForPasskey) {
      logger.warnOnce(
        `<Input autoComplete="webauthn"> can only be used with <Input type="text"> or <Input type="email">`,
      );
    } else if (hasPasskeyAutofillProp) {
      logger.warnOnce(
        `<Input autoComplete="webauthn"> can only be used inside <SignIn> in order to trigger a sign-in attempt, otherwise it will be ignored.`,
      );
    }

    return (
      <field.Element
        ref={forwardedRef}
        {...field.props}
      />
    );
  },
);

Input.displayName = INPUT_NAME;

const InputWithPasskeyAutofill = React.forwardRef<React.ElementRef<typeof RadixControl>, FormInputProps>(
  (props: FormInputProps, forwardedRef) => {
    const signInRouterRef = SignInRouterCtx.useActorRef(true);
    const passkeyAutofillSupported = useSignInPasskeyAutofill();

    React.useEffect(() => {
      if (passkeyAutofillSupported) {
        signInRouterRef?.send({ type: 'AUTHENTICATE.PASSKEY.AUTOFILL' });
      }
    }, [passkeyAutofillSupported, signInRouterRef]);

    const field = useInput(props);
    return (
      <field.Element
        ref={forwardedRef}
        {...field.props}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Label
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'ClerkElementsLabel';

/**
 * Renders a `<label>` element that is automatically associated with its sibling `<Input />` inside of a `<Field>`. Additional props will be passed through to the `<label>` element.
 *
 * @param {boolean} [asChild] - If true, `<Label />` will render as its child element, passing along any necessary props.
 *
 * @example
 * <Clerk.Field name="email">
 *   <Clerk.Label>Email</Clerk.Label>
 *   <Clerk.Input />
 * </Clerk.Field>
 */
const Label = RadixLabel;

Label.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * Submit
 * -----------------------------------------------------------------------------------------------*/

const SUBMIT_NAME = 'ClerkElementsSubmit';

type FormSubmitProps = SetRequired<RadixFormSubmitProps, 'children'>;
type FormSubmitComponent = React.ForwardRefExoticComponent<FormSubmitProps & React.RefAttributes<HTMLButtonElement>>;

/**
 * A `<button type="submit">` element.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 */
const Submit = RadixSubmit as FormSubmitComponent;

Submit.displayName = SUBMIT_NAME;

/* -------------------------------------------------------------------------------------------------
 * GlobalError & FieldError
 * -----------------------------------------------------------------------------------------------*/

const GLOBAL_ERROR_NAME = 'ClerkElementsGlobalError';
const FIELD_ERROR_NAME = 'ClerkElementsFieldError';

type FormErrorRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;

type FormErrorPropsAsChild = {
  asChild?: true | never;
  children?: React.ReactElement | ((error: FormErrorRenderProps) => React.ReactNode);
  code?: string;
};

type FormErrorPropsStd = {
  asChild?: false;
  children: React.ReactNode;
  code: string;
};

type FormErrorProps<T> = Omit<T, 'asChild' | 'children'> & (FormErrorPropsStd | FormErrorPropsAsChild);

type FormGlobalErrorElement = React.ElementRef<'div'>;
type FormGlobalErrorProps = FormErrorProps<React.ComponentPropsWithoutRef<'div'>>;
type FormFieldErrorElement = React.ElementRef<typeof RadixFormMessage>;
type FormFieldErrorProps = FormErrorProps<RadixFormMessageProps & { name?: string }>;

/**
 * Used to render errors that are returned from Clerk's API, but that are not associated with a specific form field. By default, will render the error's message wrapped in a `<div>`. Optionally, the `children` prop accepts a function to completely customize rendering. Must be placed **inside** components like `<SignIn>`/`<SignUp>` to have access to the underlying form state.
 *
 * @param {string} [code] - Forces the message with the matching code to be shown. This is useful when using server-side validation.
 * @param {Function} [children] - A function that receives `message` and `code` as arguments.
 * @param {boolean} [asChild] - If `true`, `<GlobalError>` will render as its child element, passing along any necessary props.
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.GlobalError />
 * </SignIn.Root>
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.GlobalError code="user_locked">Your custom error message.</Clerk.GlobalError>
 * </SignIn.Root>
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.GlobalError>
 *     {({ message, code }) => (
 *       <span data-error-code={code}>{message}</span>
 *     )}
 *   </Clerk.GlobalError>
 * </SignIn.Root>
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

    if (isReactFragment(child)) {
      throw new ClerkElementsRuntimeError('<GlobalError /> cannot render a Fragment as a child.');
    }

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
 * FieldError renders error messages associated with a specific field. By default, the error's message will be rendered in an unstyled `<span>`. Optionally, the `children` prop accepts a function to completely customize rendering.
 *
 * @param {string} [name] - Used to target a specific field by name when rendering outside of a `<Field>` component.
 * @param {Function} [children] - A function that receives `message` and `code` as arguments.
 *
 * @example
 * <Clerk.Field name="email">
 *   <Clerk.FieldError />
 * </Clerk.Field>
 *
 * @example
 * <Clerk.Field name="email">
 *   <Clerk.FieldError>
 *     {({ message, code }) => (
 *       <span data-error-code={code}>{message}</span>
 *     )}
 *   </Clerk.FieldError>
 * </Clerk.Field>
 */
const FieldError = React.forwardRef<FormFieldErrorElement, FormFieldErrorProps>(
  ({ asChild = false, children, code, name, ...rest }, forwardedRef) => {
    const fieldContext = useFieldContext();
    const rawFieldName = fieldContext?.name || name;
    const fieldName = rawFieldName === 'backup_code' ? 'code' : rawFieldName;
    const { feedback } = useFieldFeedback({ name: fieldName });

    if (!(feedback?.type === 'error')) {
      return null;
    }

    const error = feedback.message;

    if (!error) {
      return null;
    }

    const Comp = asChild ? Slot : 'span';
    const child = typeof children === 'function' ? children(error) : children;

    // const forceMatch = code ? error.code === code : undefined; // TODO: Re-add when Radix Form is updated

    if (isReactFragment(child)) {
      throw new ClerkElementsRuntimeError('<FieldError /> cannot render a Fragment as a child.');
    }

    return (
      <RadixFormMessage
        data-error-code={error.code}
        // forceMatch={forceMatch}
        {...rest}
        ref={forwardedRef}
        asChild
      >
        <Comp>{child || error.message}</Comp>
      </RadixFormMessage>
    );
  },
);

GlobalError.displayName = GLOBAL_ERROR_NAME;
FieldError.displayName = FIELD_ERROR_NAME;

export { Field, FieldError, FieldState, Form, GlobalError, Input, Label, Submit };
export type {
  RadixFormControlProps as FormControlProps,
  FormErrorProps,
  FormErrorRenderProps,
  FormFieldErrorProps,
  FormFieldProps,
  FormGlobalErrorProps,
  FormInputProps,
  FormProps,
  FormSubmitProps,
};
