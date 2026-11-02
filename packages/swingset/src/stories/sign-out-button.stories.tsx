import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { SignOutButtonView } from '@clerk/mosaic/features/sign-out-button/sign-out-button.view';
import { SignOut } from '@clerk/mosaic/icons/glyphs/sign-out';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-out-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'SignOutButton',
  label: 'Sign out button',
  status: 'stable',
  source: 'packages/mosaic/src/features/sign-out-button/sign-out-button.tsx',
};

function noop() {}

export function Default(_args: Record<string, unknown>) {
  return <SignOutButtonView onSignOut={noop} />;
}

export function CustomElement(_args: Record<string, unknown>) {
  return (
    <SignOutButtonView
      onSignOut={noop}
      render={
        <Button
          variant='outline'
          color='neutral'
        />
      }
    >
      <Icon glyph={SignOut} />
      Log out
    </SignOutButtonView>
  );
}

export function Pending(_args: Record<string, unknown>) {
  return (
    <SignOutButtonView
      onSignOut={noop}
      isPending
      render={<Button />}
    />
  );
}
