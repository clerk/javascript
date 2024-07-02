import type { User } from '@clerk/backend';

import { clerkClient } from '../../server/clerkClient';
import { auth } from './auth';

export async function currentUser(): Promise<User | null> {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  return clerkClient().users.getUser(userId);
}
