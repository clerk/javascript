import { isTruthy } from '@clerk/shared/underscore';
// @ts-expect-error - Exists only in devDependencies; Removed by tsup for production builds
// eslint-disable-next-line import/no-unresolved
import { createBrowserInspector } from '@statelyai/inspect';

export const getInspector = () => {
  if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    isTruthy(process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG_UI)
  ) {
    const { inspect } = createBrowserInspector({
      autoStart: true,
    });

    return inspect;
  }

  return undefined;
};
