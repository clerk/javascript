import { UserButton } from '@clerk/remix';
import { getAuth } from '@clerk/remix/ssr.server';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const loader: LoaderFunction = async args => {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect('/sign-in');
  }
  return {};
};

export default function Protected() {
  return (
    <div>
      <h1>Protected route</h1>
      <p>You are signed in!</p>
      <UserButton afterSignOutUrl='/' />
    </div>
  );
}
