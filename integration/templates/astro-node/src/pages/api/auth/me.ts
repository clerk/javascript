import type { APIRoute } from 'astro';

const unautorized = () =>
  new Response(JSON.stringify({ error: 'unathorized access' }), {
    status: 401,
  });

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.auth().userId) {
    return unautorized();
  }

  return new Response(JSON.stringify(await locals.currentUser()), {
    status: 200,
  });
};
