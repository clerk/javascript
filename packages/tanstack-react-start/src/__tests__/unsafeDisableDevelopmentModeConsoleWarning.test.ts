import type { RequestState } from '@clerk/backend/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mergeWithPublicEnvs, pickFromClerkInitState } from '../client/utils';
import { getResponseClerkState } from '../server/utils';

const createRequestState = (): RequestState =>
  ({
    domain: undefined,
    isSatellite: false,
    publishableKey: 'pk_test_xxx',
    proxyUrl: undefined,
    signInUrl: undefined,
    signUpUrl: undefined,
    toAuth: () => ({}),
  }) as RequestState;

describe('unsafe_disableDevelopmentModeConsoleWarning', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('preserves an explicit false from the initial state when public env is true', () => {
    vi.stubEnv('VITE_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING', 'true');

    const result = mergeWithPublicEnvs({
      unsafe_disableDevelopmentModeConsoleWarning: false,
    });

    expect(result.unsafe_disableDevelopmentModeConsoleWarning).toBe(false);
  });

  it('hydrates the unprefixed env value from server state', () => {
    vi.stubEnv('CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING', 'true');

    const clerkInitialState = getResponseClerkState(createRequestState());
    const pickedState = pickFromClerkInitState(clerkInitialState.__internal_clerk_state);
    const result = mergeWithPublicEnvs(pickedState);

    expect(result.unsafe_disableDevelopmentModeConsoleWarning).toBe(true);
  });
});
