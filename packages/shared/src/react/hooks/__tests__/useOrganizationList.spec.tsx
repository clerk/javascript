import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetClerkQueryClientForTest } from '@/react/query/clerk-query-client';

import { useOrganizationList } from '../useOrganizationList';
import { createMockClerk, createMockQueryClient, createMockUser } from './mocks/clerk';
import { wrapper } from './wrapper';

let activeClerk: any;
let activeUser: any;

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => activeClerk,
  useInitialStateContext: () => undefined,
}));

vi.mock('../base/useUserBase', () => ({
  useUserBase: () => activeUser,
}));

vi.mock('../useAttemptToEnableOrganizations', () => ({
  useAttemptToEnableOrganizations: () => {},
}));

afterEach(() => {
  vi.clearAllMocks();
  __resetClerkQueryClientForTest();
});

describe('useOrganizationList', () => {
  describe('isLoaded/data contract', () => {
    beforeEach(() => {
      const qc = createMockQueryClient();
      activeUser = createMockUser();
      activeClerk = createMockClerk({
        queryClient: qc,
        loaded: true,
        setActive: vi.fn(),
        createOrganization: vi.fn(),
      });

      activeUser.getOrganizationMemberships = vi.fn(
        () =>
          new Promise(resolve => {
            setTimeout(
              () => resolve({ data: [{ id: 'om_1', organization: { id: 'org_1', name: 'Acme' } }], total_count: 1 }),
              50,
            );
          }),
      );
      activeUser.getOrganizationInvitations = vi.fn();
      activeUser.getOrganizationSuggestions = vi.fn();
    });

    it('never emits isLoaded: true with an empty data array while the query is in flight', async () => {
      const { result } = renderHook(() => useOrganizationList({ userMemberships: true }), { wrapper });

      const snapshot = () => ({
        isLoaded: result.current.isLoaded,
        data: result.current.userMemberships.data,
        isLoading: result.current.userMemberships.isLoading,
      });

      const states: Array<ReturnType<typeof snapshot>> = [];
      states.push(snapshot());

      await waitFor(() => {
        states.push(snapshot());
        expect((result.current.userMemberships.data as any[])?.length).toBeGreaterThan(0);
      });

      const buggy = states.filter(s => s.isLoaded && Array.isArray(s.data) && s.data.length === 0);
      expect(buggy, 'isLoaded was true while data was still an empty array').toHaveLength(0);
    });

    it('does not report isLoaded: true on the first render before data arrives', async () => {
      const { result } = renderHook(() => useOrganizationList({ userMemberships: true }), { wrapper });

      if (result.current.isLoaded) {
        const { data } = result.current.userMemberships;
        expect(
          data === undefined || (Array.isArray(data) && data.length > 0),
          'isLoaded: true but data is empty on first render',
        ).toBe(true);
      }

      await waitFor(() => {
        expect((result.current.userMemberships.data as any[])?.length).toBeGreaterThan(0);
      });
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('pre-loaded states', () => {
    it('returns isLoaded: false when clerk is not loaded', () => {
      createMockQueryClient();
      activeUser = createMockUser();
      activeClerk = createMockClerk({ loaded: false });

      const { result } = renderHook(() => useOrganizationList({ userMemberships: true }), { wrapper });
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.userMemberships.data).toBeUndefined();
    });

    it('returns isLoaded: false when user is null', () => {
      createMockQueryClient();
      activeUser = null;
      activeClerk = createMockClerk({ loaded: true });

      const { result } = renderHook(() => useOrganizationList({ userMemberships: true }), { wrapper });
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.userMemberships.data).toBeUndefined();
    });
  });
});
