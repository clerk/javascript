import { SignInButton, SignUpButton } from '@clerk/react';

export default function Home() {
  return (
    <main>
      <SignInButton
        mode='modal'
        forceRedirectUrl='/protected'
        signUpForceRedirectUrl='/protected'
      >
        Sign in button (force)
      </SignInButton>

      <SignInButton
        mode='modal'
        fallbackRedirectUrl='/protected'
      >
        Sign in button (fallback)
      </SignInButton>

      <SignUpButton
        mode='modal'
        forceRedirectUrl='/protected'
        signInForceRedirectUrl='/protected'
      >
        Sign up button (force)
      </SignUpButton>

      <SignUpButton
        mode='modal'
        fallbackRedirectUrl='/protected'
      >
        Sign up button (fallback)
      </SignUpButton>
    </main>
  );
}
