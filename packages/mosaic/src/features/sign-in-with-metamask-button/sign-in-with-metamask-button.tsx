'use client';

import type { ReactElement, ReactNode } from 'react';

import type { SignInWithMetamaskButtonReadyModel } from './sign-in-with-metamask-button.controller';
import { useSignInWithMetamaskButtonController } from './sign-in-with-metamask-button.controller';
import type { SignInWithMetamaskButtonOptions } from './sign-in-with-metamask-button.model';
import { useSignInWithMetamaskButtonModel } from './sign-in-with-metamask-button.model';
import type { SignInWithMetamaskButtonElementProps } from './sign-in-with-metamask-button.view';
import { SignInWithMetamaskButtonView } from './sign-in-with-metamask-button.view';

/** Everything `<SignInWithMetamaskButton />` takes: where to go after, the element it renders, and what stands in while Clerk loads. */
export interface SignInWithMetamaskButtonProps
  extends SignInWithMetamaskButtonOptions, SignInWithMetamaskButtonElementProps {
  /**
   * Fallback while loading.
   *
   * Note that the component renders nothing when MetaMask is not enabled as a sign-in strategy, so
   * using this on such an application can result in Fallback->Nothing.
   */
  fallback?: ReactNode;
}

/**
 * A headless button that signs the user in with their MetaMask wallet. It ships no styles: it renders
 * a plain `<button>` labelled "Sign in with MetaMask", `children` replaces the label, and `render`
 * swaps the element for your own. Your `onClick` runs alongside starting sign-in. The button is
 * disabled while the wallet asks for a signature. It renders `fallback` until Clerk answers, and
 * nothing at all when MetaMask is not enabled as a sign-in strategy.
 *
 * @example
 * ```tsx
 * import { SignInWithMetamaskButton } from '@clerk/mosaic/features/sign-in-with-metamask-button/sign-in-with-metamask-button';
 *
 * <SignInWithMetamaskButton />
 * ```
 *
 * @example
 * `redirectUrl` is where the user lands after signing in.
 * ```tsx
 * <SignInWithMetamaskButton redirectUrl='/dashboard' render={<MyButton />} />
 * ```
 */
export function SignInWithMetamaskButton({
  fallback,
  redirectUrl,
  ...props
}: SignInWithMetamaskButtonProps = {}): ReactElement | null {
  const model = useSignInWithMetamaskButtonModel({ redirectUrl });

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  if (model.status === 'hidden') {
    return null;
  }

  return (
    <ReadySignInWithMetamaskButton
      {...props}
      model={model}
    />
  );
}

function ReadySignInWithMetamaskButton({
  model,
  ...props
}: SignInWithMetamaskButtonElementProps & { model: SignInWithMetamaskButtonReadyModel }) {
  const controller = useSignInWithMetamaskButtonController(model);

  return (
    <SignInWithMetamaskButtonView
      {...props}
      {...controller}
    />
  );
}
