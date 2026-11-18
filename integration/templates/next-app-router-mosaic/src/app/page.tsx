import { Show, SignInButton } from '@clerk/nextjs';

import { MosaicSwitcher } from './mosaic-switcher';

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
      <MosaicSwitcher />
    </header>
  );
}
