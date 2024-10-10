import { __experimental_protectRoute } from '@clerk/nextjs/server';

export const POST = __experimental_protectRoute().route(auth => {
  return new Response(
    JSON.stringify({
      userId: auth.userId,
    }),
    { status: 200 },
  );
});
