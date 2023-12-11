import { SignedIn, SignedOut, SignIn, UserButton, Protect } from '@clerk/nextjs';

export default function Home() {
  return (
    <main>
      <UserButton />
      <SignedIn>SignedIn</SignedIn>
      <SignedOut>SignedOut</SignedOut>
      <Protect fallback={'SignedOut from protect'}>SignedIn from protect</Protect>
      <SignIn
        path={'/'}
        signUpUrl={'/sign-up'}
      />
    </main>
  );
}
