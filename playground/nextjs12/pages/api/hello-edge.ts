import type { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export const config = {
  runtime: 'experimental-edge',
};

export default async function handler(req: NextRequest) {
  const auth = getAuth(req);
  console.log('/api/hello-edge ', auth.userId, req.nextUrl.toString());

  return new Response(
    JSON.stringify({
      user_id: auth.userId,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}
