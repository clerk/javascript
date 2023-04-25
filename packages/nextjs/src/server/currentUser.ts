import type { User } from '@clerk/backend';

import { auth } from './auth';
import { clerkClient } from './clerkClient';

export async function currentUser(): Promise<User | null> {
  const { userId } = auth();
  return userId ? clerkClient.users.getUser(userId) : null;
}
