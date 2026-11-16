'use client';

import type { ReactElement, ReactNode } from 'react';

import type { SignOutButtonReadyModel } from './sign-out-button.controller';
import { useSignOutButtonController } from './sign-out-button.controller';
import type { SignOutButtonOptions } from './sign-out-button.model';
import { useSignOutButtonModel } from './sign-out-button.model';
import type { SignOutButtonElementProps } from './sign-out-button.view';
import { SignOutButtonView } from './sign-out-button.view';

/** Everything `<SignOutButton />` takes: which session to end and where to go after, the element it renders, and what stands in while Clerk loads. */
export interface SignOutButtonProps extends SignOutButtonOptions, SignOutButtonElementProps {
  /**
   * Fallback while loading.
   *
   * Note that the component renders nothing when the user is signed out, so using this on
   * pages that are reachable while both signed-out and signed-in can result in Fallback->Nothing.
   */
  fallback?: ReactNode;
}

/**
 * A headless button that signs the user out. It ships no styles: it renders a plain `<button>`
 * labelled "Sign out", `children` replaces the label, and `render` swaps the element for your own.
 * Your `onClick` runs alongside signing out. It renders `fallback` until Clerk answers, and nothing
 * at all when nobody is signed in.
 *
 * @example
 * ```tsx
 * import { SignOutButton } from '@clerk/mosaic/features/sign-out-button/sign-out-button';
 *
 * <SignOutButton />
 * ```
 *
 * @example
 * `sessionId` signs out one session and leaves the others signed in.
 * ```tsx
 * <SignOutButton sessionId={session.id} redirectUrl='/goodbye' />
 * ```
 */
export function SignOutButton({
  fallback,
  redirectUrl,
  sessionId,
  ...props
}: SignOutButtonProps = {}): ReactElement | null {
  const model = useSignOutButtonModel({ redirectUrl, sessionId });

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  if (model.status === 'hidden') {
    return null;
  }

  return (
    <ReadySignOutButton
      {...props}
      model={model}
    />
  );
}

function ReadySignOutButton({ model, ...props }: SignOutButtonElementProps & { model: SignOutButtonReadyModel }) {
  const controller = useSignOutButtonController(model);

  return (
    <SignOutButtonView
      {...props}
      {...controller}
    />
  );
}
