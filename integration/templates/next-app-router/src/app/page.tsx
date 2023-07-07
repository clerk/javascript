import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main>
      <UserButton />
      <SignedIn>SignedIn</SignedIn>
      <SignedOut>SignedOut</SignedOut>
      <SignIn
        path={'/'}
        signUpUrl={'/sign-up'}
      />
    </main>
  );
}
