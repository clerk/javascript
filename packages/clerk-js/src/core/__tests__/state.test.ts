import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '../events';
import { SignIn } from '../resources/SignIn';
import { SignUp } from '../resources/SignUp';
import { signInResourceSignal, signUpResourceSignal } from '../signals';
import { State } from '../state';

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
        const _nullSignUp = new SignUp(null);

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
            // reset() emits resource:error to clear errors, but the signal update
            // happens via resource:update when the new SignUp is created
            eventBus.emit('resource:error', { resource: newSignUpFromReset, error: null });
            // Emit resource:update to update the signal (simulating what happens in real flow)
            eventBus.emit('resource:update', { resource: newSignUpFromReset });
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
        const _existingSignUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
        expect(signUpResourceSignal().resource?.id).toBe('signup_123');

        // Act: Emit a resource update with a different SignUp that also has an id
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
        const _nullSignIn = new SignIn(null);

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
            eventBus.emit('resource:error', { resource: newSignInFromReset, error: null });
            eventBus.emit('resource:update', { resource: newSignInFromReset });
          }),
        };
        SignIn.clerk = { client: mockClient } as any;

        // Create a SignIn with id
        const existingSignIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);
        expect(signInResourceSignal().resource?.id).toBe('signin_123');
        expect(existingSignIn.__internal_future.canBeDiscarded).toBe(false);

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
        const _existingSignIn = new SignIn({ id: 'signin_123', status: 'needs_identifier' } as any);
        expect(signInResourceSignal().resource?.id).toBe('signin_123');

        // Act: Emit a resource update with a different SignIn that also has an id
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
      const _signUp1 = new SignUp({ id: 'signup_1', status: 'missing_requirements' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_1');

      // Second update with another valid SignUp
      const _signUp2 = new SignUp({ id: 'signup_2', status: 'missing_requirements' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_2');

      // Null update should be ignored
      const _nullSignUp = new SignUp(null);
      expect(signUpResourceSignal().resource?.id).toBe('signup_2');

      // Another valid update should work
      const _signUp3 = new SignUp({ id: 'signup_3', status: 'complete' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_3');
    });

    it('should handle update with same instance correctly', () => {
      // Create a SignUp
      const signUp = new SignUp({ id: 'signup_123', status: 'missing_requirements' } as any);
      expect(signUpResourceSignal().resource?.id).toBe('signup_123');

      // Manually emit update with the same instance (simulating fromJSON on same instance)
      eventBus.emit('resource:update', { resource: signUp });

      // Signal should still have the same instance
      expect(signUpResourceSignal().resource).toBe(signUp);
    });
  });
});
