import type { UserResource } from '@clerk/shared/types';

export interface UserAvatarData extends Partial<Pick<UserResource, 'imageUrl'>> {
  /** The user's full name, or their identifier when they have none. */
  name: string;
  initials: string;
}
