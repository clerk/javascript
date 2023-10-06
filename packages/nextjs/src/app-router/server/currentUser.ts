import type { User } from '@clerk/backend';

import { clerkClient } from '../../server/clerkClient';
import { auth } from './auth';

// eslint-disable-next-line @typescript-eslint/require-await
export async function currentUser(): Promise<User | null> {
  const { userId } = auth();
  return userId ? clerkClient.users.getUser(userId) : null;
}
