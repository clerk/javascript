import { auth } from '@clerk/nextjs/server';

export function GET() {
  const { userId } = auth();
  return new Response(JSON.stringify({ userId }));
}
