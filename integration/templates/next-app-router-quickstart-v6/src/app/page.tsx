import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <header>
      <SignedOut>
        <p>signed-out-state</p>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <p>signed-in-state</p>
        <UserButton />
      </SignedIn>
    </header>
  );
}
