import { getAuth } from '@clerk/react-router/server';

import type { Route } from './+types/me';

// Returns the userId @clerk/react-router resolves for THIS request. The isolation e2e hits
// this concurrently with two different users' session cookies and asserts each response
// carries its own user, even though the server shares one RouterContextProvider.
export async function loader(args: Route.LoaderArgs) {
  // Optional delay so the e2e can hold this request inside the loader, after clerkMiddleware
  // wrote auth onto the shared context, while a concurrent request overwrites that context.
  const delay = Number(new URL(args.request.url).searchParams.get('delay')) || 0;
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const { userId } = await getAuth(args);
  return Response.json({ userId: userId ?? null });
}
