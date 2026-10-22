import { getClerkClientAndRouting } from '@clerk/nextjs/internal/server';
import { auth } from '@clerk/nextjs/server';

import {
  prefetchProfile as prefetchRequestProfile,
  prefetchSessions as prefetchRequestSessions,
  prefetchUser as prefetchRequestUser,
} from './server';

export async function prefetchSessions() {
  const { userId, sessionId } = await auth();
  return prefetchRequestSessions({
    identity: { userId, sessionId },
    resolveBackend: getClerkClientAndRouting,
  });
}

export async function prefetchUser() {
  const { userId, sessionId } = await auth();
  return prefetchRequestUser({ identity: { userId, sessionId }, resolveBackend: getClerkClientAndRouting });
}

export async function prefetchProfile() {
  try {
    const { userId, sessionId } = await auth();
    return await prefetchRequestProfile({ identity: { userId, sessionId }, resolveBackend: getClerkClientAndRouting });
  } catch {
    return undefined;
  }
}
