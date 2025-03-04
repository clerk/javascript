export const sessionTaskRoutePaths = ['add-organization'] as const;

export type SessionTaskRoutePath = (typeof sessionTaskRoutePaths)[number];
