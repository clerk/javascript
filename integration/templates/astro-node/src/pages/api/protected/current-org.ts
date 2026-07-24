import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const GET: APIRoute = async context => {
  const { locals } = context;
  const { userId, orgId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'unauthorized access' }), {
      status: 401,
    });
  }

  if (!orgId) {
    return new Response(JSON.stringify({ error: 'select or create an organization' }), {
      status: 400,
    });
  }

  return new Response(
    JSON.stringify(
      await clerkClient(context).organizations.getOrganization({
        organizationId: orgId,
      }),
    ),
    {
      status: 200,
    },
  );
};
