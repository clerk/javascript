import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth.protect((has: any) => has({ role: 'admin' }) || has({ role: 'org:editor' }));
  return new Response(JSON.stringify({ userId }));
}
