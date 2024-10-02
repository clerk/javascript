import { protectRoute } from '@clerk/nextjs/server';

export const POST = protectRoute()
  .with({
    role: 'org:admin',
  })
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
