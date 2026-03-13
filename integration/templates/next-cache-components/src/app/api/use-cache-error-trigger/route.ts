import { auth } from '@clerk/nextjs/server';
import { connection } from 'next/server';

// This function deliberately calls auth() inside "use cache" to trigger the error
async function getCachedAuthData() {
  'use cache';
  // This WILL throw an error because auth() uses headers() internally
  const { userId } = await auth();
  return { userId };
}

export async function GET() {
  // Force dynamic rendering so the route is not prerendered at build time.
  // Without this, `next build` tries to statically generate the route and
  // the deliberate auth()-inside-"use cache" error crashes the build.
  await connection();

  try {
    const data = await getCachedAuthData();
    return Response.json(data);
  } catch (e: any) {
    // Return the error message so we can verify it in tests
    return Response.json({ error: e.message }, { status: 500 });
  }
}
