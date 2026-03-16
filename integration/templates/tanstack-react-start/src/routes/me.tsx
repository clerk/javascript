import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { auth } from '@clerk/tanstack-react-start/server';

const fetchAuthData = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId, sessionId, orgId, orgRole, orgSlug } = await auth();
  return { userId, sessionId, orgId, orgRole, orgSlug };
});

export const Route = createFileRoute('/me')({
  component: MePage,
  beforeLoad: async () => await fetchAuthData(),
  loader: async ({ context }) => {
    return {
      userId: context.userId,
      sessionId: context.sessionId,
      orgId: context.orgId,
      orgRole: context.orgRole,
      orgSlug: context.orgSlug,
    };
  },
});

function MePage() {
  const state = Route.useLoaderData();

  return (
    <div>
      <p data-testid='userId'>{state.userId ?? ''}</p>
      <p data-testid='sessionId'>{state.sessionId ?? ''}</p>
      <p data-testid='orgId'>{state.orgId ?? ''}</p>
      <p data-testid='orgRole'>{state.orgRole ?? ''}</p>
      <p data-testid='orgSlug'>{state.orgSlug ?? ''}</p>
    </div>
  );
}
