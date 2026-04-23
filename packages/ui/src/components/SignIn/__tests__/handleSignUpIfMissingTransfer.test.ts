import type { LoadedClerk } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleSignUpIfMissingTransfer } from '../handleSignUpIfMissingTransfer';

const mockNavigate = vi.fn();

const createMockClerk = (signUpCreateResult: unknown = {}) => {
  return {
    client: {
      sessions: [],
      signUp: {
        create: vi.fn().mockResolvedValue(signUpCreateResult),
      },
      reload: vi.fn(),
    },
    navigate: vi.fn(),
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
      signUpUrl: 'https://test.com/sign-up',
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
      signUpUrl: 'https://test.com/sign-up',
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
      signUpUrl: 'https://test.com/sign-up',
    });

    expect(clerk.setActive).toHaveBeenCalledWith(
      expect.objectContaining({
        session: 'sess_123',
      }),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('uses clerk.navigate with the decorated afterSignUpUrl when the session has no pending task', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' }) as LoadedClerk & {
      navigate: ReturnType<typeof vi.fn>;
      setActive: ReturnType<typeof vi.fn>;
    };

    const decorateUrl = vi.fn((url: string) => `${url}?decorated`);

    clerk.setActive.mockImplementation(async params => {
      await params.navigate({
        session: { currentTask: null } as any,
        decorateUrl,
      });
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      signUpUrl: 'https://test.com/sign-up',
    });

    expect(decorateUrl).toHaveBeenCalledWith('https://test.com');
    expect(clerk.navigate).toHaveBeenCalledWith('https://test.com?decorated');
  });

  it('routes to the pending task via clerk.navigate when the session has a current task', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' }) as LoadedClerk & {
      navigate: ReturnType<typeof vi.fn>;
      setActive: ReturnType<typeof vi.fn>;
    };

    clerk.setActive.mockImplementation(async params => {
      await params.navigate({
        session: { currentTask: { key: 'choose-organization' } } as any,
        decorateUrl: (url: string) => url,
      });
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      signUpUrl: 'https://test.com/sign-up',
    });

    // navigateIfTaskExists builds an absolute task URL from signUpUrl and calls clerk.navigate
    expect(clerk.navigate).toHaveBeenCalledTimes(1);
    const target = (clerk.navigate as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(target).toContain('choose-organization');
  });

  it('routes to the continue page when sign-up has missing fields', async () => {
    const clerk = createMockClerk({
      status: 'missing_requirements',
      missingFields: ['first_name'],
      unverifiedFields: [],
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      signUpUrl: 'https://test.com/sign-up',
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toContain('/continue');
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('routes to verify-email-address when sign-up has unverified email and no missing fields', async () => {
    const clerk = createMockClerk({
      status: 'missing_requirements',
      missingFields: [],
      unverifiedFields: ['email_address'],
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      signUpUrl: 'https://test.com/sign-up',
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toContain('/verify-email-address');
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('routes to verify-phone-number when sign-up has unverified phone and no missing fields', async () => {
    const clerk = createMockClerk({
      status: 'missing_requirements',
      missingFields: [],
      unverifiedFields: ['phone_number'],
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      signUpUrl: 'https://test.com/sign-up',
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toContain('/verify-phone-number');
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('should throw on unexpected sign-up status', async () => {
    const clerk = createMockClerk({ status: 'abandoned' });

    await expect(
      handleSignUpIfMissingTransfer({
        clerk,
        navigate: mockNavigate,
        afterSignUpUrl: 'https://test.com',
        signUpUrl: 'https://test.com/sign-up',
      }),
    ).rejects.toThrow('Unexpected sign-up status after transfer: abandoned');
  });
});
