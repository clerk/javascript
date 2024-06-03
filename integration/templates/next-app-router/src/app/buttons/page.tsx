import { SignInButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main>
      <SignInButton
        mode='modal'
        forceRedirectUrl='/protected'
      >
        Sign in button (force)
      </SignInButton>

      <SignInButton
        mode='modal'
        fallbackRedirectUrl='/protected'
      >
        Sign in button (fallback)
      </SignInButton>
    </main>
  );
}
