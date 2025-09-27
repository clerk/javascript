import { redirect } from 'react-router';
import { UserProfile } from '@clerk/react-router';
import { clerkClient, getAuth } from '@clerk/react-router/server';
import type { Route } from './+types/profile';

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect('/sign-in');
  }

  const user = await clerkClient(args).users.getUser(userId);

  return {
    firstName: user.firstName,
    emailAddress: user.emailAddresses[0].emailAddress,
  };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Protected</h1>
      <UserProfile />
      <ul>
        <li>First name: {loaderData.firstName}</li>
        <li>Email: {loaderData.emailAddress}</li>
      </ul>
    </div>
  );
}
