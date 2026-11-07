import { Button } from '@clerk/mosaic/components/button';
import { SignInWithMetamaskButtonView } from '@clerk/mosaic/features/sign-in-with-metamask-button/sign-in-with-metamask-button.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-in-with-metamask-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'SignInWithMetamaskButton',
  label: 'Sign in with MetaMask button',
  status: 'stable',
  source: 'packages/mosaic/src/features/sign-in-with-metamask-button/sign-in-with-metamask-button.tsx',
};

function noop() {}

export function Default(_args: Record<string, unknown>) {
  return <SignInWithMetamaskButtonView onSignIn={noop} />;
}

export function CustomElement(_args: Record<string, unknown>) {
  return (
    <SignInWithMetamaskButtonView
      onSignIn={noop}
      render={
        <Button
          variant='outline'
          color='neutral'
        />
      }
    >
      Connect wallet
    </SignInWithMetamaskButtonView>
  );
}

export function Pending(_args: Record<string, unknown>) {
  return (
    <SignInWithMetamaskButtonView
      onSignIn={noop}
      isPending
      render={<Button />}
    />
  );
}
