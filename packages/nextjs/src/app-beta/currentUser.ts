import { auth } from './auth';
import { clerkClient } from './clerkClient';

export function currentUser() {
  const { userId } = auth();
  return userId ? clerkClient.users.getUser(userId) : null;
}
