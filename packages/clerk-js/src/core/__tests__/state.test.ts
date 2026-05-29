import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '../events';
import { SignIn } from '../resources/SignIn';
import { SignUp } from '../resources/SignUp';
import { signInFetchSignal, signInResourceSignal, signUpResourceSignal } from '../signals';
import { State } from '../state';

describe('Signal batching', () => {
  let state: State;

  beforeEach(() => {
    signInResourceSignal({ resource: null });
    signInFetchSignal({ status: 'idle' });
    state = new State();
  });

  it('should produce at most 3 renders with clean fetchStatus transitions during an API call', async () => {
    const signIn = new SignIn(null);
    const snapshots: Array<{ fetchStatus: string; hasSignIn: boolean }> = [];

    state.__internal_effect(() => {
      const s = state.signInSignal();
      snapshots.push({ fetchStatus: s.fetchStatus, hasSignIn: s.signIn !== null });
    });

    await signIn.__internal_future.password({ password: 'test123', identifier: 'test@example.com' }).catch(() => {
      // Expected to fail since there's no real API
    });

    expect(snapshots.length).toBeLessThanOrEqual(3);

    // fetchStatus follows a clean idle → fetching → idle progression
    const transitions = snapshots.map(s => s.fetchStatus).filter((s, i, arr) => i === 0 || s !== arr[i - 1]);
    expect(transitions).toEqual(['idle', 'fetching', 'idle']);
  });

  it('should skip resource-only updates while fetching and apply them on idle', () => {
    const signIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);

    // Simulate fetchStatus: fetching (as runAsyncResourceTask would)
    eventBus.emit('resource:state-change', { resource: signIn, error: null, fetchStatus: 'fetching' });
    expect(signInFetchSignal().status).toBe('fetching');

    // Simulate fromJSON updating the resource mid-flight (resource-only event)
    eventBus.emit('resource:state-change', { resource: signIn });

    // Resource signal should NOT have been updated — skipped while fetching
    expect(signInResourceSignal().resource?.id).toBe('signin_123');

    // Simulate task completion — resource is carried again with fetchStatus: idle
    eventBus.emit('resource:state-change', { resource: signIn, error: null, fetchStatus: 'idle' });

    // Now both resource and fetchStatus are consistent
    expect(signInFetchSignal().status).toBe('idle');
    expect(signInResourceSignal().resource).toBe(signIn);
  });

  it('should reflect new resource data immediately when no operation is in flight', () => {
    let latestSignInId: string | undefined;

    state.__internal_effect(() => {
      latestSignInId = state.signInSignal().signIn?.id;
    });

    expect(latestSignInId).toBeUndefined();

    new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);

    expect(latestSignInId).toBe('signin_123');
  });
});

describe('State', () => {
  let _state: State;

  // Capture original static clerk references to restore after tests
  const originalSignUpClerk = SignUp.clerk;
  const originalSignInClerk = SignIn.clerk;

  beforeEach(() => {
    // Reset signals to initial state
    signUpResourceSignal({ resource: null });
    signInResourceSignal({ resource: null });
    // Create a new State instance which registers event handlers
    _state = new State();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset signals after each test
    signUpResourceSignal({ resource: null });
    signInResourceSignal({ resource: null });
    // Restore original clerk references to prevent global state leakage
    SignUp.clerk = originalSignUpClerk;
    SignIn.clerk = originalSignInClerk;
  });

  describe('shouldIgnoreNullUpdate behavior', () => {
    describe('SignUp', () => {
      it('should allow first resource update when previous resource is null', () => {
        // Arrange: Signal starts with null
        expect(signUpResourceSignal().resource).toBeNull();

        // Act: Emit a resource update with a SignUp that has an id
        const signUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);

        // Assert: Signal should be updated
        expect(signUpResourceSignal().resource).toBe(signUp);
        expect(signUpResourceSignal().resource?.id).toBe('signup_123');
      });

      it('should ignore null resource update when previous resource exists and canBeDiscarded is false', () => {
        // Arrange: Set up a SignUp with id and canBeDiscarded = false (default)
        const existingSignUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        expect(signUpResourceSignal().resource).toBe(existingSignUp);
        expect(existingSignUp.__internal_future.canBeDiscarded).toBe(false);

        // Act: Emit a resource update with a null SignUp (simulating client refresh with null sign_up)
        new SignUp(null);

        // Assert: Signal should NOT be updated - should still have the existing SignUp
        expect(signUpResourceSignal().resource).toBe(existingSignUp);
        expect(signUpResourceSignal().resource?.id).toBe('signup_123');
      });

      it('should allow null resource update when previous resource exists and canBeDiscarded is true', async () => {
        // Arrange: Set up a SignUp with id and mock setActive
        const mockSetActive = vi.fn().mockResolvedValue({});
        SignUp.clerk = { setActive: mockSetActive } as any;

        const existingSignUp = new SignUp({
          id: 'signup_123',
          status: 'complete',
          created_session_id: 'session_123',
        } as any);
        expect(signUpResourceSignal().resource).toBe(existingSignUp);
        expect(existingSignUp.__internal_future.canBeDiscarded).toBe(false);

        // Act: Call finalize() which sets canBeDiscarded to true
        await existingSignUp.__internal_future.finalize();

        // Verify canBeDiscarded is now true
        expect(existingSignUp.__internal_future.canBeDiscarded).toBe(true);
        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123', navigate: undefined });

        // Now emit a null resource update (simulating client refresh with null sign_up)
        const nullSignUp = new SignUp(null);

        // Assert: The null update SHOULD be allowed because canBeDiscarded is true
        // shouldIgnoreNullUpdate returns false when canBeDiscarded is true
        expect(signUpResourceSignal().resource).toBe(nullSignUp);
        expect(signUpResourceSignal().resource?.id).toBeUndefined();
      });

      it('should allow null resource update after reset() is called', async () => {
        // Arrange: Set up mock client that tracks the new SignUp created during reset
        let newSignUpFromReset: SignUp | null = null;
        const mockClient = {
          signUp: new SignUp(null),
          resetSignUp: vi.fn().mockImplementation(function (this: typeof mockClient) {
            newSignUpFromReset = new SignUp(null);
            this.signUp = newSignUpFromReset;
          }),
        };
        SignUp.clerk = { client: mockClient } as any;

        // Create a SignUp with id
        const existingSignUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        expect(signUpResourceSignal().resource?.id).toBe('signup_123');
        expect(existingSignUp.__internal_future.canBeDiscarded).toBe(false);

        // Act: Call reset() - this sets canBeDiscarded to true before resetting
        await existingSignUp.__internal_future.reset();

        // Assert: Verify reset was called
        expect(mockClient.resetSignUp).toHaveBeenCalled();

        // Assert: Verify canBeDiscarded was set to true on the original SignUp
        expect(existingSignUp.__internal_future.canBeDiscarded).toBe(true);

        // Assert: Verify the signal was updated with a new SignUp that has no id
        // The previous id 'signup_123' should be gone
        expect(signUpResourceSignal().resource).toBe(newSignUpFromReset);
        expect(signUpResourceSignal().resource?.id).toBeUndefined();
      });

      it('should allow resource update when new resource has an id (not a null update)', () => {
        // Arrange: Set up a SignUp with id
        new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        expect(signUpResourceSignal().resource?.id).toBe('signup_123');

        // Act: Create a different SignUp that also has an id
        const newSignUp = new SignUp({ id: 'signup_456', status: 'complete' } as any);

        // Assert: Signal should be updated with the new SignUp
        expect(signUpResourceSignal().resource).toBe(newSignUp);
        expect(signUpResourceSignal().resource?.id).toBe('signup_456');
      });
    });

    describe('SignIn', () => {
      it('should allow first resource update when previous resource is null', () => {
        // Arrange: Signal starts with null
        expect(signInResourceSignal().resource).toBeNull();

        // Act: Emit a resource update with a SignIn that has an id
        const signIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);

        // Assert: Signal should be updated
        expect(signInResourceSignal().resource).toBe(signIn);
        expect(signInResourceSignal().resource?.id).toBe('signin_123');
      });

      it('should ignore null resource update when previous resource exists and canBeDiscarded is false', () => {
        // Arrange: Set up a SignIn with id and canBeDiscarded = false (default)
        const existingSignIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);
        expect(signInResourceSignal().resource).toBe(existingSignIn);
        expect(existingSignIn.__internal_future.canBeDiscarded).toBe(false);

        // Act: Emit a resource update with a null SignIn (simulating client refresh with null sign_in)
        new SignIn(null);

        // Assert: Signal should NOT be updated - should still have the existing SignIn
        expect(signInResourceSignal().resource).toBe(existingSignIn);
        expect(signInResourceSignal().resource?.id).toBe('signin_123');
      });

      it('should allow null resource update when previous resource exists and canBeDiscarded is true', async () => {
        // Arrange: Set up a SignIn with id and mock setActive
        const mockSetActive = vi.fn().mockResolvedValue({});
        SignIn.clerk = { setActive: mockSetActive, client: { sessions: [{ id: 'session_123' }] } } as any;

        const existingSignIn = new SignIn({
          id: 'signin_123',
          status: 'complete',
          created_session_id: 'session_123',
        } as any);
        expect(signInResourceSignal().resource).toBe(existingSignIn);
        expect(existingSignIn.__internal_future.canBeDiscarded).toBe(false);

        // Act: Call finalize() which sets canBeDiscarded to true
        await existingSignIn.__internal_future.finalize();

        expect(existingSignIn.__internal_future.canBeDiscarded).toBe(true);
        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123', navigate: undefined });

        // Now emit a null resource update
        const nullSignIn = new SignIn(null);

        // Assert: The null update SHOULD be allowed because canBeDiscarded is true
        expect(signInResourceSignal().resource).toBe(nullSignIn);
        expect(signInResourceSignal().resource?.id).toBeUndefined();
      });

      it('should allow null resource update after reset() is called', async () => {
        // Arrange: Set up mock client
        let newSignInFromReset: SignIn | null = null;
        const mockClient = {
          signIn: new SignIn(null),
          resetSignIn: vi.fn().mockImplementation(function (this: typeof mockClient) {
            newSignInFromReset = new SignIn(null);
            this.signIn = newSignInFromReset;
          }),
        };
        SignIn.clerk = { client: mockClient } as any;

        // Create a SignIn with id
        const existingSignIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);
        expect(signInResourceSignal().resource?.id).toBe('signin_123');

        // Act: Call reset()
        await existingSignIn.__internal_future.reset();

        // Assert
        expect(mockClient.resetSignIn).toHaveBeenCalled();
        expect(existingSignIn.__internal_future.canBeDiscarded).toBe(true);
        expect(signInResourceSignal().resource).toBe(newSignInFromReset);
        expect(signInResourceSignal().resource?.id).toBeUndefined();
      });

      it('should allow resource update when new resource has an id (not a null update)', () => {
        // Arrange: Set up a SignIn with id
        new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);
        expect(signInResourceSignal().resource?.id).toBe('signin_123');

        // Act: Create a different SignIn that also has an id
        const newSignIn = new SignIn({ id: 'signin_456', status: 'complete' } as any);

        // Assert: Signal should be updated with the new SignIn
        expect(signInResourceSignal().resource).toBe(newSignIn);
        expect(signInResourceSignal().resource?.id).toBe('signin_456');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid successive updates correctly', () => {
      // First update with valid SignUp
      new SignUp({ id: 'signup_1', status: 'missing_requirements' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_1');

      // Second update with another valid SignUp
      new SignUp({ id: 'signup_2', status: 'missing_requirements' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_2');

      // Null update should be ignored
      new SignUp(null);
      expect(signUpResourceSignal().resource?.id).toBe('signup_2');

      // Another valid update should work
      new SignUp({ id: 'signup_3', status: 'complete' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_3');
    });

    it('should handle update with same instance correctly', () => {
      // Create a SignUp
      const signUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_123');

      // Manually emit update with the same instance (simulating fromJSON on same instance)
      eventBus.emit('resource:state-change', { resource: signUp });

      // Signal should still have the same instance
      expect(signUpResourceSignal().resource).toBe(signUp);
    });
  });

  describe('Client.destroy()', () => {
    it('should update signals when resources are replaced with null instances', async () => {
      const mockSetActive = vi.fn().mockResolvedValue({});
      SignIn.clerk = { setActive: mockSetActive, client: { sessions: [{ id: 'session_123' }] } } as any;

      const existingSignIn = new SignIn({
        id: 'signin_123',
        status: 'complete',
        created_session_id: 'session_123',
      } as any);
      expect(signInResourceSignal().resource).toBe(existingSignIn);

      await existingSignIn.__internal_future.finalize();
      expect(existingSignIn.__internal_future.canBeDiscarded).toBe(true);

      // Simulates what Client.destroy() does — creating a null resource replaces the existing one
      const nullSignIn = new SignIn(null);

      expect(signInResourceSignal().resource).toBe(nullSignIn);
      expect(signInResourceSignal().resource?.id).toBeUndefined();
    });
  });

  describe('fetchStatus clearing on reset', () => {
    it('should clear fetchStatus to idle when resource is reset during an in-flight fetch', () => {
      const signIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);
      eventBus.emit('resource:state-change', { resource: signIn, error: null, fetchStatus: 'fetching' });
      expect(signInFetchSignal().status).toBe('fetching');

      // Reset replaces the resource and clears fetchStatus in one event
      const nullSignIn = new SignIn(null);
      eventBus.emit('resource:state-change', { resource: nullSignIn, error: null, fetchStatus: 'idle' });

      expect(signInFetchSignal().status).toBe('idle');
    });
  });
});
