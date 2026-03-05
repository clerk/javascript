import type { Clerk } from '@clerk/shared/types';
import { render } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent, shallowRef } from 'vue';

import { useOrganization } from '../useOrganization';

const mockAttemptToEnableEnvironmentSetting = vi.fn();

const mockLoaded = shallowRef(false);
const mockClerk = shallowRef<Partial<Clerk> | null>(null);

vi.mock('../useClerkContext', () => ({
  useClerkContext: () => ({
    loaded: mockLoaded,
    clerk: mockClerk,
    organizationCtx: shallowRef(undefined),
  }),
}));

vi.mock('../useSession', () => ({
  useSession: () => ({
    session: shallowRef(null),
  }),
}));

describe('useOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoaded.value = false;
    mockClerk.value = null;
  });

  it('should not call __internal_attemptToEnableEnvironmentSetting before Clerk is loaded', () => {
    mockClerk.value = {
      __internal_attemptToEnableEnvironmentSetting: mockAttemptToEnableEnvironmentSetting,
    };

    const Component = defineComponent(() => {
      useOrganization();
      return () => null;
    });

    render(Component);

    expect(mockAttemptToEnableEnvironmentSetting).not.toHaveBeenCalled();
  });

  it('should call __internal_attemptToEnableEnvironmentSetting after Clerk is loaded', async () => {
    mockClerk.value = {
      __internal_attemptToEnableEnvironmentSetting: mockAttemptToEnableEnvironmentSetting,
    };

    const Component = defineComponent(() => {
      useOrganization();
      return () => null;
    });

    render(Component);

    mockLoaded.value = true;

    await vi.waitFor(() => {
      expect(mockAttemptToEnableEnvironmentSetting).toHaveBeenCalledWith({
        for: 'organizations',
        caller: 'useOrganization',
      });
    });
  });
});
