'use server';

import { auth } from '@clerk/nextjs/server';

export async function checkAuthAction() {
  const { userId, sessionId } = await auth();
  return { userId, sessionId };
}
