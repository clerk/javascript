'use client';

import type { ReactElement, ReactNode } from 'react';

import type { SignUpButtonReadyModel } from './sign-up-button.controller';
import { useSignUpButtonController } from './sign-up-button.controller';
import type { SignUpButtonOptions } from './sign-up-button.model';
import { useSignUpButtonModel } from './sign-up-button.model';
import type { SignUpButtonElementProps } from './sign-up-button.view';
import { SignUpButtonView } from './sign-up-button.view';

/** Everything `<SignUpButton />` takes: where sign-up goes, the element it renders, and what stands in while Clerk loads. */
export interface SignUpButtonProps extends SignUpButtonOptions, SignUpButtonElementProps {
  /** Rendered while Clerk loads. */
  fallback?: ReactNode;
}

/**
 * A headless button that starts sign-up. It ships no styles: it renders a plain `<button>` labelled
 * "Sign up", `children` replaces the label, and `render` swaps the element for your own. Your
 * `onClick` runs alongside starting sign-up. It navigates to the sign-up page, or opens sign-up in a
 * modal when `mode` is `'modal'`. It renders `fallback` until Clerk answers.
 *
 * @example
 * ```tsx
 * import { SignUpButton } from '@clerk/mosaic/features/sign-up-button/sign-up-button';
 *
 * <SignUpButton />
 * ```
 *
 * @example
 * `render` takes the element to render, with the button's props merged into it.
 * ```tsx
 * <SignUpButton mode='modal' render={<MyButton />}>Create an account</SignUpButton>
 * ```
 */
export function SignUpButton({
  fallback,
  mode,
  forceRedirectUrl,
  fallbackRedirectUrl,
  signInForceRedirectUrl,
  signInFallbackRedirectUrl,
  initialValues,
  unsafeMetadata,
  oauthFlow,
  ...props
}: SignUpButtonProps = {}): ReactElement {
  const model = useSignUpButtonModel({
    mode,
    forceRedirectUrl,
    fallbackRedirectUrl,
    signInForceRedirectUrl,
    signInFallbackRedirectUrl,
    initialValues,
    unsafeMetadata,
    oauthFlow,
  });

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  return (
    <ReadySignUpButton
      {...props}
      model={model}
    />
  );
}

function ReadySignUpButton({ model, ...props }: SignUpButtonElementProps & { model: SignUpButtonReadyModel }) {
  const controller = useSignUpButtonController(model);

  return (
    <SignUpButtonView
      {...props}
      {...controller}
    />
  );
}
