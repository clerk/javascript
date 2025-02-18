import type { SessionTask } from '@clerk/types';

/**
 * @internal
 */
export const sessionTaskRoutePaths: Record<SessionTask['key'], string> = {
  org: 'select-organization',
};
