import { __experimental_protectRoute } from '@clerk/nextjs/server';

export const POST = __experimental_protectRoute()
  .with({
    reverification: {
      level: 'secondFactor',
      afterMinutes: 1,
    },
  })
  .route(auth => {
    return new Response(
      JSON.stringify({
        userId: auth.userId,
      }),
      { status: 200 },
    );
  });
