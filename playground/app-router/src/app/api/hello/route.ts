import { createClerkClient } from '@clerk/backend';
import { auth, clerkClient } from '@clerk/nextjs/dist/types/server';
export async function GET(request: Request) {
  const help = await auth({ entity: 'machine' });

  // const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  // const help = await client.authenticateRequest(request);
  // const help2 = await (await clerkClient()).authenticateRequest(request, { entity: 'machine' });
  // const help3 = await (await clerkClient()).authenticateRequest(request);
  // const clerk = await (await client).authenticateRequest(request, { entity: 'user' });
  return new Response('Hello, Next.js!');
}
