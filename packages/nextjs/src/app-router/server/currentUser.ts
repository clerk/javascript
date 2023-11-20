import type { User } from '@clerk/backend';

import { clerkClient } from '../../server/clerkClient';
import { auth } from './auth';

export async function currentUser(): Promise<User | null> {
  const { userId } = auth();
  if (!userId) return null;

  const { data, errors } = await clerkClient.users.getUser(userId);
  if (errors) return null;

  return data;
}
