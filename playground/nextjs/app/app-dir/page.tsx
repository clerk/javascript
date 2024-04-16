import {
  auth,
  clerkClient,
  currentUser,
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';

export default async function Page() {
  const { userId } = auth();
  const currentUser_ = await currentUser();
  const user = userId ? await clerkClient.users.getUser(userId) : null;
  console.log({ userId, currentUser_, user });

  return (
    <main>
      <ul>
        <li>
          <Link href={'/sign-in'}>Sign in page</Link>
        </li>
        <li>
          <Link href={'/sign-up'}>Sign up page</Link>
        </li>
        <li>
          <Link href={'/user'}>User profile page</Link>
        </li>
        <li>
          <Link href={'/user-examples'}>User examples</Link>
        </li>
      </ul>
      <div>
        <h1>Hello, Next.js!</h1>
        {userId ? <h3>Signed in as: {userId}</h3> : <h3>Signed out</h3>}
        <SignedIn>
          <UserButton
            userProfileMode='navigation'
            userProfileUrl='/app-dir/user'
          />
          <OrganizationSwitcher
            organizationProfileUrl='/app-dir/organization'
            createOrganizationUrl='/app-dir/create-organization'
            organizationProfileMode={'navigation'}
            createOrganizationMode={'navigation'}
          />
          <div>{JSON.stringify(user)}</div>
          <div>{JSON.stringify(currentUser_)}</div>
        </SignedIn>
        <SignedOut>
          <SignIn />
        </SignedOut>
      </div>
    </main>
  );
}
