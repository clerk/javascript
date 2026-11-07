import { Button } from '@clerk/mosaic/components/button';
import { SignUpButtonView } from '@clerk/mosaic/features/sign-up-button/sign-up-button.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-up-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'SignUpButton',
  label: 'Sign up button',
  status: 'stable',
  source: 'packages/mosaic/src/features/sign-up-button/sign-up-button.tsx',
};

function noop() {}

export function Default(_args: Record<string, unknown>) {
  return <SignUpButtonView onSignUp={noop} />;
}

export function CustomElement(_args: Record<string, unknown>) {
  return (
    <SignUpButtonView
      onSignUp={noop}
      render={
        <Button
          variant='outline'
          color='neutral'
        />
      }
    >
      Create an account
    </SignUpButtonView>
  );
}

export function Pending(_args: Record<string, unknown>) {
  return (
    <SignUpButtonView
      onSignUp={noop}
      isPending
      render={<Button />}
    />
  );
}
