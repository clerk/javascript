import { Show, SignInButton } from '@clerk/nextjs';

import { MosaicUserButton } from './mosaic-user-button';

export default function Home() {
  return (
    <header>
      <Show when='signed-out'>
        <p>signed-out-state</p>
        <SignInButton />
      </Show>
      <Show when='signed-in'>
        <p>signed-in-state</p>
      </Show>
      <MosaicUserButton />
    </header>
  );
}
