'use client';

import type { ReactElement, ReactNode } from 'react';

import type { SignInButtonReadyModel } from './sign-in-button.controller';
import { useSignInButtonController } from './sign-in-button.controller';
import type { SignInButtonOptions } from './sign-in-button.model';
import { useSignInButtonModel } from './sign-in-button.model';
import type { SignInButtonElementProps } from './sign-in-button.view';
import { SignInButtonView } from './sign-in-button.view';

/** Everything `<SignInButton />` takes: where sign-in goes, the element it renders, and what stands in while Clerk loads. */
export interface SignInButtonProps extends SignInButtonOptions, SignInButtonElementProps {
  /** Rendered while Clerk loads. */
  fallback?: ReactNode;
}

/**
 * A headless button that starts sign-in. It ships no styles: it renders a plain `<button>` labelled
 * "Sign in", `children` replaces the label, and `render` swaps the element for your own. Your
 * `onClick` runs alongside starting sign-in. It navigates to the sign-in page, or opens sign-in in a
 * modal when `mode` is `'modal'`. It renders `fallback` until Clerk answers.
 *
 * @example
 * ```tsx
 * import { SignInButton } from '@clerk/mosaic/features/sign-in-button/sign-in-button';
 *
 * <SignInButton />
 * ```
 *
 * @example
 * `render` takes the element to render, with the button's props merged into it.
 * ```tsx
 * <SignInButton mode='modal' render={<MyButton variant='outline' />}>Log in</SignInButton>
 * ```
 */
export function SignInButton({
  fallback,
  mode,
  forceRedirectUrl,
  fallbackRedirectUrl,
  signUpForceRedirectUrl,
  signUpFallbackRedirectUrl,
  initialValues,
  withSignUp,
  oauthFlow,
  ...props
}: SignInButtonProps = {}): ReactElement {
  const model = useSignInButtonModel({
    mode,
    forceRedirectUrl,
    fallbackRedirectUrl,
    signUpForceRedirectUrl,
    signUpFallbackRedirectUrl,
    initialValues,
    withSignUp,
    oauthFlow,
  });

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  return (
    <ReadySignInButton
      {...props}
      model={model}
    />
  );
}

function ReadySignInButton({ model, ...props }: SignInButtonElementProps & { model: SignInButtonReadyModel }) {
  const controller = useSignInButtonController(model);

  return (
    <SignInButtonView
      {...props}
      {...controller}
    />
  );
}
