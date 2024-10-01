import { protectRoute } from '@clerk/nextjs/server';

// export function GET() {
//   const { userId } = auth().protect(has => has({ role: 'admin' }) || has({ role: 'org:editor' }));
//   return new Response(JSON.stringify({ userId }));
// }

export const GET = protectRoute()
  .with({
    role: 'org:admin',
  })
  .route(_auth => {
    const { userId } = _auth;
    return new Response(JSON.stringify({ userId }));
  });
