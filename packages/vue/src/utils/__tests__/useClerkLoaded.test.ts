import type { Clerk } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref, type ShallowRef } from 'vue';

import * as composables from '../../composables';
import { useClerkLoaded } from '../useClerkLoaded';

// Mock the useClerk composable
vi.mock('../../composables', () => ({
  useClerk: vi.fn(),
}));

describe('useClerkLoaded', () => {
  let clerkRef: ShallowRef<Clerk | null>;
  let mockClerk: Partial<Clerk>;

  beforeEach(() => {
    clerkRef = ref(null) as ShallowRef<Clerk | null>;
    mockClerk = {
      loaded: false,
    };
    vi.mocked(composables.useClerk).mockReturnValue(clerkRef);
  });

  it('should not call callback when clerk is null', async () => {
    const callback = vi.fn();

    // Call useClerkLoaded
    useClerkLoaded(callback);

    await nextTick();

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when clerk exists but not loaded', async () => {
    const callback = vi.fn();

    // Call useClerkLoaded
    useClerkLoaded(callback);

    // Set clerk instance but not loaded
    clerkRef.value = { ...mockClerk, loaded: false } as Clerk;

    await nextTick();

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call callback when clerk becomes loaded', async () => {
    const callback = vi.fn();

    // Call useClerkLoaded
    useClerkLoaded(callback);

    // Set clerk instance as loaded
    const loadedClerk = { ...mockClerk, loaded: true } as Clerk;
    clerkRef.value = loadedClerk;

    await nextTick();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(loadedClerk);
  });

  it('should call callback immediately if clerk is already loaded', async () => {
    const callback = vi.fn();

    // Set clerk instance as loaded before calling useClerkLoaded
    const loadedClerk = { ...mockClerk, loaded: true } as Clerk;
    clerkRef.value = loadedClerk;

    // Call useClerkLoaded
    useClerkLoaded(callback);

    await nextTick();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(loadedClerk);
  });

  it('should only call callback once even if clerk updates multiple times', async () => {
    const callback = vi.fn();

    // Call useClerkLoaded
    useClerkLoaded(callback);

    // Set clerk instance as loaded
    const loadedClerk1 = { ...mockClerk, loaded: true, client: { id: 'client_1' } } as Clerk;
    clerkRef.value = loadedClerk1;

    await nextTick();

    expect(callback).toHaveBeenCalledOnce();

    // Update clerk instance again (simulating a resource update)
    const loadedClerk2 = { ...mockClerk, loaded: true, client: { id: 'client_2' } } as Clerk;
    clerkRef.value = loadedClerk2;

    await nextTick();

    // Should still only be called once due to unwatch()
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(loadedClerk1);
  });

  it('should handle transition from null -> not loaded -> loaded', async () => {
    const callback = vi.fn();

    // Call useClerkLoaded
    useClerkLoaded(callback);

    // Initial state: null
    expect(callback).not.toHaveBeenCalled();

    // Clerk instance created but not loaded
    clerkRef.value = { ...mockClerk, loaded: false } as Clerk;
    await nextTick();
    expect(callback).not.toHaveBeenCalled();

    // Clerk becomes loaded
    clerkRef.value = { ...mockClerk, loaded: true } as Clerk;
    await nextTick();

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should properly clean up watcher after callback is called', async () => {
    const callback = vi.fn();

    // Call useClerkLoaded
    useClerkLoaded(callback);

    // Set clerk as loaded
    const loadedClerk = { ...mockClerk, loaded: true } as Clerk;
    clerkRef.value = loadedClerk;

    await nextTick();

    expect(callback).toHaveBeenCalledOnce();

    // Simulate multiple updates (watcher should be cleaned up)
    for (let i = 0; i < 5; i++) {
      clerkRef.value = { ...mockClerk, loaded: true, session: { id: `sess_${i}` } } as Clerk;
      await nextTick();
    }

    // Should still only be called once
    expect(callback).toHaveBeenCalledOnce();
  });
});
