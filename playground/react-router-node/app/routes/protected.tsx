import { UserButton } from '@clerk/react-router';
import { getAuth } from '@clerk/react-router/ssr.server';
import type { LoaderFunction } from 'react-router';
import { redirect } from 'react-router';

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
