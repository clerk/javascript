import { OrganizationSwitcher, Show, SignIn, UserButton } from '@clerk/nextjs';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Page() {
  const { userId } = await auth();
  const currentUser_ = await currentUser();
  const user = userId ? await (await clerkClient()).users.getUser(userId) : null;

  return (
    <main>
      <ul>
        <li>
          <Link href={'/app-dir/sign-in'}>Sign in page</Link>
        </li>
        <li>
          <Link href={'/app-dir/sign-up'}>Sign up page</Link>
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
        {/* @ts-ignore */}
        <Show when='signedIn'>
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
        </Show>
        {/* @ts-ignore */}
        <Show when='signedOut'>
          <SignIn routing='hash' />
        </Show>
      </div>
    </main>
  );
}
