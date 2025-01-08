import { redirect } from 'react-router';
import { UserProfile } from '@clerk/react-router';
import { getAuth } from '@clerk/react-router/ssr.server';
import { createClerkClient } from '@clerk/react-router/api.server';
import type { Route } from './+types/profile';

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect('/sign-in');
  }

  const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(userId);

  return {
    user,
  };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Protected</h1>
      <UserProfile />
      <ul>
        <li>First name: {loaderData.user.firstName}</li>
        <li>Email: {loaderData.user.emailAddresses[0].emailAddress}</li>
      </ul>
    </div>
  );
}
