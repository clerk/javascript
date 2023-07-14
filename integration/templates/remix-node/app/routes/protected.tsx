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
      <h1>Protected</h1>
    </div>
  );
}
