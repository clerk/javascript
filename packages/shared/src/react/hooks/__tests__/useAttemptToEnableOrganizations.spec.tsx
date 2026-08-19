import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAttemptToEnableOrganizations } from '../useAttemptToEnableOrganizations';
import { useOrganization } from '../useOrganization';
import { useOrganizationList } from '../useOrganizationList';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

// Hoisted so the `../../contexts` factory below can reach it: that module is pulled in while the two
// hooks are imported, which is before a plain module-level const would have been assigned.
const mockState = vi.hoisted(() => ({ attemptSpy: vi.fn(), clerk: undefined as any }));
const attemptSpy = mockState.attemptSpy;

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockState.clerk,
  useInitialStateContext: () => undefined,
}));

mockState.clerk = createMockClerk({
  queryClient: createMockQueryClient(),
  __internal_attemptToEnableEnvironmentSetting: attemptSpy,
});

vi.mock('../base/useUserBase', () => ({ useUserBase: () => ({ id: 'user_1' }) }));
vi.mock('../base/useOrganizationBase', () => ({ useOrganizationBase: () => null }));
vi.mock('../base/useSessionBase', () => ({ useSessionBase: () => null }));

describe('useAttemptToEnableOrganizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attempts once by default', () => {
    const { rerender } = renderHook(() => useAttemptToEnableOrganizations('useOrganizationList'), { wrapper });
    rerender();

    expect(attemptSpy).toHaveBeenCalledTimes(1);
    expect(attemptSpy).toHaveBeenCalledWith({ for: 'organizations', caller: 'useOrganizationList' });
  });

  // An app that reads the hook without wanting organizations would otherwise be shown the dev-only
  // prompt to turn them on, which is an answer to a question it never asked.
  it('attempts nothing when disabled', () => {
    renderHook(() => useAttemptToEnableOrganizations('useOrganizationList', false), { wrapper });

    expect(attemptSpy).not.toHaveBeenCalled();
  });

  it('attempts once the caller opts back in', () => {
    const { rerender } = renderHook(({ enabled }) => useAttemptToEnableOrganizations('useOrganization', enabled), {
      wrapper,
      initialProps: { enabled: false },
    });
    expect(attemptSpy).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(attemptSpy).toHaveBeenCalledTimes(1);
    expect(attemptSpy).toHaveBeenCalledWith({ for: 'organizations', caller: 'useOrganization' });
  });
});

// The two public hooks are the only callers, so this is the contract an app actually holds.
describe('the enabled param on the organization hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attempts by default', () => {
    renderHook(() => useOrganizationList(), { wrapper });
    expect(attemptSpy).toHaveBeenCalledWith({ for: 'organizations', caller: 'useOrganizationList' });

    renderHook(() => useOrganization(), { wrapper });
    expect(attemptSpy).toHaveBeenCalledWith({ for: 'organizations', caller: 'useOrganization' });
  });

  it('attempts nothing when either hook is disabled', () => {
    renderHook(() => useOrganizationList({ enabled: false }), { wrapper });
    renderHook(() => useOrganization({ enabled: false }), { wrapper });

    expect(attemptSpy).not.toHaveBeenCalled();
  });
});
