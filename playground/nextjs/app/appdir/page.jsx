import { auth, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/nextjs/app-beta';

export default function Page() {
  const { userId } = auth();
  return (
    <div>
      <h1>Hello, Next.js!</h1>
      {userId ? <h3>Signed in as: {userId}</h3> : <h3>Signed out</h3>}
      <SignedIn>
        <UserButton
          userProfileMode='navigation'
          userProfileUrl='/appdir/user'
        />
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  );
}
