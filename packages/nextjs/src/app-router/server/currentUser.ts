import type { User } from '@clerk/backend';

import { clerkClient } from '../../server/clerkClient';
import { auth } from './auth';

export async function currentUser(): Promise<User | null> {
  require('server-only');

  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  return (await clerkClient()).users.getUser(userId);
}
