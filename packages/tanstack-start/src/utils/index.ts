import { buildErrorThrower } from '@clerk/shared';

export const isClient = typeof window !== 'undefined';

export const isServer = !isClient;

export const errorThrower = buildErrorThrower({
  packageName: PACKAGE_NAME,
});
