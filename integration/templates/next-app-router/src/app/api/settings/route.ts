import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { protect } = await auth();
  const { userId } = protect(has => has({ role: 'admin' }) || has({ role: 'org:editor' }));
  return new Response(JSON.stringify({ userId }));
}
