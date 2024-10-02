import { protectRoute } from '@clerk/nextjs/server';

export const POST = protectRoute()
  .with({
    role: 'org:admin',
  })
  .route(auth => {
    return new Response(
      JSON.stringify({
        userId: auth.userId,
      }),
      { status: 200 },
    );
  });
