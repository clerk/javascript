import { useClerk } from '@clerk/clerk-react';
import { logger } from '@clerk/shared/logger';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type {
  Control as RadixControl,
  FormControlProps,
  FormControlProps as RadixFormControlProps,
} from '@radix-ui/react-form';
import * as React from 'react';

import { SignInRouterCtx } from '~/react/sign-in/context';
import { useSignInPasskeyAutofill } from '~/react/sign-in/context/router.context';

import { useInput } from './hooks';
import type { OTPInputProps } from './otp';

const INPUT_NAME = 'ClerkElementsInput';

type PasswordInputProps = Exclude<FormControlProps, 'type'> & {
  validatePassword?: boolean;
};

export type FormInputProps =
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
export const Input = React.forwardRef<React.ElementRef<typeof RadixControl>, FormInputProps>(
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
