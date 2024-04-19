import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { CAPTCHA_ELEMENT_ID } from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignUpStartCtx } from './start';

export type SignUpCaptchaElement = React.ElementRef<'div'>;
export type SignUpCaptchaProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  asChild?: boolean;
};

export const SignUpCaptcha = React.forwardRef<SignUpCaptchaElement, SignUpCaptchaProps>(
  ({ asChild, children, ...rest }, forwardedRef) => {
    const ref = SignUpStartCtx.useActorRef(true);

    if (!ref) {
      throw new ClerkElementsRuntimeError(
        '<SignUp.Captcha> must be used within the <SignUp.Step name="start"> component.',
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
