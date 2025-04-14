import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const GET: APIRoute = async context => {
  const { locals } = context;
  const { auth } = locals;

  if (auth().has({ role: 'org:admin' })) {
    return new Response(
      JSON.stringify(
        await clerkClient(context).organizations.getOrganization({
          organizationId: auth().orgId!,
        }),
      ),
      {
        status: 200,
      },
    );
  }

  return new Response(JSON.stringify({ error: 'select or create an organization' }), {
    status: 400,
  });
};
