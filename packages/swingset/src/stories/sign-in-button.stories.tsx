import { Button } from '@clerk/mosaic/components/button';
import { SignInButtonView } from '@clerk/mosaic/features/sign-in-button/sign-in-button.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-in-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'SignInButton',
  label: 'Sign in button',
  status: 'stable',
  source: 'packages/mosaic/src/features/sign-in-button/sign-in-button.tsx',
};

function noop() {}

export function Default(_args: Record<string, unknown>) {
  return <SignInButtonView onSignIn={noop} />;
}

export function CustomElement(_args: Record<string, unknown>) {
  return (
    <SignInButtonView
      onSignIn={noop}
      render={
        <Button
          variant='outline'
          color='neutral'
        />
      }
    >
      Log in
    </SignInButtonView>
  );
}

export function Pending(_args: Record<string, unknown>) {
  return (
    <SignInButtonView
      onSignIn={noop}
      isPending
      render={<Button />}
    />
  );
}
