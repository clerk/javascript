import { protectRoute } from '@clerk/nextjs/server';

export const POST = protectRoute().route(auth => {
  return new Response(
    JSON.stringify({
      userId: auth.userId,
    }),
    { status: 200 },
  );
});
