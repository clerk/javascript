import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const authObj = await auth();
  return new Response(
    JSON.stringify({
      userId: authObj.userId,
      sessionId: authObj.sessionId,
    }),
    {
      headers: { 'content-type': 'application/json' },
    },
  );
}
