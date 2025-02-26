import type { SessionTask } from '@clerk/types';

export const sessionTaskRoutePaths = ['add-organization'] as const;

type SessionTaskRoutePath = (typeof sessionTaskRoutePaths)[number];

/**
 * @internal
 */
export const sessionTaskKeyToRoutePaths: Record<SessionTask['key'], SessionTaskRoutePath> = {
  org: 'add-organization',
};
