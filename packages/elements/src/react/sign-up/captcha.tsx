import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { CAPTCHA_ELEMENT_ID } from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignUpStartCtx } from './start';

export type SignUpCaptchaElement = React.ElementRef<'div'>;

type CaptchaElementProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'id' | 'children'
>;

export type SignUpCaptchaProps =
  | ({
      asChild: true;
      /* Must only be a self-closing element/component */
      children: React.ReactElement;
    } & CaptchaElementProps)
  | ({ asChild?: false; children?: undefined } & CaptchaElementProps);

/**
 * The `<SignUp.Captcha>` component is used to render the Cloudflare Turnstile widget. It must be used within the `<SignUp.Step name="start">` component.
 *
 * If utilizing the `asChild` prop, the component must be a self-closing element or component. Any children passed to the immediate child component of <SignUp.Captcha> will be ignored.
 *
 * @param {boolean} [asChild] - If true, `<Captcha />` will render as its child element, passing along any necessary props.
 *
 * @example
 * <SignUp.Root>
 *   <SignUp.Step name="start">
 *     <SignUp.Captcha />
 *     <Clerk.Action submit>Sign Up</Clerk.Action>
 *   </SignUp.Step>
 * </SignUp.Root>
 *
 * @example
 * <SignUp.Root>
 *   <SignUp.Step name="start">
 *     <SignUp.Captcha asChild>
 *       <aside/>
 *     </SignUp.Captcha>
 *     <Clerk.Action submit>Sign Up</Clerk.Action>
 *   </SignUp.Step>
 * </SignUp.Root>
 */

export const SignUpCaptcha = React.forwardRef<SignUpCaptchaElement, SignUpCaptchaProps>(
  ({ asChild, children, ...rest }, forwardedRef) => {
    const ref = SignUpStartCtx.useActorRef(true);

    if (!ref) {
      throw new ClerkElementsRuntimeError('<Captcha> must be used within the <SignUp.Step name="start"> component.');
    }

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        id={CAPTCHA_ELEMENT_ID}
        {...rest}
        ref={forwardedRef}
      />
    );
  },
);
