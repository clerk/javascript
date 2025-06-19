import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth({ acceptsToken: 'api_key' });

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  return new Response(JSON.stringify({ userId }));
}
