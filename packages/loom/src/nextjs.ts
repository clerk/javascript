import { getClerkClientAndRouting } from '@clerk/nextjs/internal/server';
import { auth } from '@clerk/nextjs/server';

import { prefetchProfile as prefetchRequestProfile, prefetchUser as prefetchRequestUser } from './server';

export async function prefetchUser() {
  const { userId, sessionId } = await auth();
  return prefetchRequestUser({ identity: { userId, sessionId }, resolveBackend: getClerkClientAndRouting });
}

export async function prefetchProfile() {
  let identity;
  try {
    const { userId, sessionId } = await auth();
    identity = { userId, sessionId };
  } catch {
    throw new Error('Loom profile authentication failed.');
  }
  return prefetchRequestProfile({ identity, resolveBackend: getClerkClientAndRouting });
}
