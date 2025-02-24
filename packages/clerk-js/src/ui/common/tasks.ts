import type { SessionTask } from '@clerk/types';

export const sessionTaskRoutePaths = ['select-organization'] as const;

type SessionTaskRoutePath = (typeof sessionTaskRoutePaths)[number];

/**
 * @internal
 */
export const sessionTaskKeyToRoutePaths: Record<SessionTask['key'], SessionTaskRoutePath> = {
  org: 'select-organization',
};
