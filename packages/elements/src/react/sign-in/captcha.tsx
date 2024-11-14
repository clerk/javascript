import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { CAPTCHA_ELEMENT_ID } from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors';

import { useActiveTags } from '../hooks';
import { SignInRouterCtx } from './context';

export type SignInCaptchaElement = React.ElementRef<'div'>;

type CaptchaElementProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'id' | 'children'
>;

export type SignInCaptchaProps =
  | ({
      asChild: true;
      /* Must only be a self-closing element/component */
      children: React.ReactElement;
    } & CaptchaElementProps)
  | ({ asChild?: false; children?: undefined } & CaptchaElementProps);

/**
 * The `<SignIn.Captcha>` component is used to render the Cloudflare Turnstile widget. It must be used within the `<SignIn.Step name="sso-callback">` component.
 *
 * If utilizing the `asChild` prop, the component must be a self-closing element or component. Any children passed to the immediate child component of <SignIn.Captcha> will be ignored.
 *
 * @param {boolean} [asChild] - If true, `<Captcha />` will render as its child element, passing along any necessary props.
 *
 * @example
 * <SignIn.Root>
 *   <SignIn.Step name="sso-callback">
 *     <SignIn.Captcha />
 *   </SignIn.Step>
 * </SignIn.Root>
 *
 * @example
 * <SignIn.Root>
 *   <SignIn.Step name="sso-callback">
 *     <SignIn.Captcha asChild>
 *       <aside/>
 *     </SignIn.Captcha>
 *   </SignIn.Step>
 * </SignIn.Root>
 */

export const SignInCaptcha = React.forwardRef<SignInCaptchaElement, SignInCaptchaProps>(
  ({ asChild, children, ...rest }, forwardedRef) => {
    const routerRef = SignInRouterCtx.useActorRef();
    const activeState = useActiveTags(routerRef, 'step:callback');

    if (!activeState) {
      throw new ClerkElementsRuntimeError(
        '<Captcha> must be used within the <SignIn.Step name="sso-callback"> component.',
      );
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
