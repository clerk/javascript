import { auth, currentUser, clerkClient, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/nextjs/app-beta';

export default async function Page() {
  const { userId } = auth();
  const user = await clerkClient.users.getUser(userId);
  const currentUser_ = await currentUser();
  return (
    <div>
      <h1>Hello, Next.js!</h1>
      {userId ? <h3>Signed in as: {userId}</h3> : <h3>Signed out</h3>}
      <SignedIn>
        <UserButton
          userProfileMode='navigation'
          userProfileUrl='/appdir/user'
        />
        <div>{JSON.stringify(user)}</div>
        <div>{JSON.stringify(currentUser_)}</div>
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  );
}
