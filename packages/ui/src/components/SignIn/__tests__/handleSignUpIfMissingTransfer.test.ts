import type { LoadedClerk } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleSignUpIfMissingTransfer } from '../handleSignUpIfMissingTransfer';

const mockNavigate = vi.fn();
const mockNavigateOnSetActive = vi.fn();

const createMockClerk = (signUpCreateResult: unknown = {}) => {
  return {
    client: {
      signUp: {
        create: vi.fn().mockResolvedValue(signUpCreateResult),
      },
    },
    setActive: vi.fn(),
  } as unknown as LoadedClerk;
};

describe('handleSignUpIfMissingTransfer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call signUp.create with transfer: true', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(clerk.client.signUp.create).toHaveBeenCalledWith({
      transfer: true,
      unsafeMetadata: undefined,
    });
  });

  it('should pass unsafeMetadata to signUp.create', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' });
    const unsafeMetadata = { foo: 'bar' };

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
      unsafeMetadata,
    });

    expect(clerk.client.signUp.create).toHaveBeenCalledWith({
      transfer: true,
      unsafeMetadata,
    });
  });

  it('should call setActive when sign-up status is complete', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(clerk.setActive).toHaveBeenCalledWith(
      expect.objectContaining({
        session: 'sess_123',
      }),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to create/continue when sign-up status is missing_requirements', async () => {
    const clerk = createMockClerk({ status: 'missing_requirements' });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(mockNavigate).toHaveBeenCalledWith('../create/continue');
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('should throw on unexpected sign-up status', async () => {
    const clerk = createMockClerk({ status: 'abandoned' });

    await expect(
      handleSignUpIfMissingTransfer({
        clerk,
        navigate: mockNavigate,
        afterSignUpUrl: 'https://test.com',
        navigateOnSetActive: mockNavigateOnSetActive,
      }),
    ).rejects.toThrow('Unexpected sign-up status after transfer: abandoned');
  });
});
