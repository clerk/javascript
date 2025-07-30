import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getAuth } from '@clerk/tanstack-react-start/server';
import { getWebRequest } from '@tanstack/react-start/server';

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest();
  if (!request) throw new Error('No request found');

  const { userId } = await getAuth(request);

  return {
    userId,
  };
});

export const Route = createFileRoute('/')({
  component: Page,
  beforeLoad: async () => await fetchClerkAuth(),
  loader: async ({ context }) => {
    return { userId: context.userId };
  },
});

function Page() {
  const state = Route.useLoaderData();

  return state.userId ? <h1>Welcome! Your ID is {state.userId}!</h1> : <h1>You are not signed in</h1>;
}
