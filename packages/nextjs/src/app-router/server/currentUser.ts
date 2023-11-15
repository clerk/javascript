import type { User } from '@clerk/backend';

import { clerkClient } from '../../server/clerkClient';
import { auth } from './auth';

export async function currentUser(): Promise<User | null> {
  const { userId } = auth();
  return userId ? clerkClient.users.getUser(userId) : null;
}
