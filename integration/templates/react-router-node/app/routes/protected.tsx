import { redirect } from 'react-router';
import { getAuth } from '@clerk/react-router/ssr.server';
import type { Route } from './+types/profile';

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url);
  }

  return {};
}

export default function Profile(args: Route.ComponentProps) {
  return (
    <div>
      <h1>Protected</h1>
    </div>
  );
}
