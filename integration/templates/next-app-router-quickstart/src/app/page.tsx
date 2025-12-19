import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <header>
      <Show when='signed-out'>
        <p>signed-out-state</p>
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when='signed-in'>
        <p>signed-in-state</p>
        <UserButton />
      </Show>
    </header>
  );
}
