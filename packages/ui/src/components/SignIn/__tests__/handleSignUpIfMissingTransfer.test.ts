import type { LoadedClerk } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleSignUpIfMissingTransfer } from '../handleSignUpIfMissingTransfer';

const mockNavigate = vi.fn();
const mockNavigateOnSetActive = vi.fn();

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
    __internal_windowNavigate: vi.fn(),
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

  it('delegates post-setActive navigation to navigateOnSetActive when the session has a pending task', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' }) as LoadedClerk & {
      setActive: ReturnType<typeof vi.fn>;
    };

    // A pending task routes into the combined flow's `create/...` task routes, which are mounted
    // inside the component, so that navigation has to stay with the in-component router.
    const session = { currentTask: { key: 'choose-organization' } } as any;
    const decorateUrl = (url: string) => url;

    clerk.setActive.mockImplementation(async params => {
      await params.navigate({ session, decorateUrl });
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(mockNavigateOnSetActive).toHaveBeenCalledWith({
      session,
      redirectUrl: 'https://test.com',
      decorateUrl,
    });
    expect((clerk as any).__internal_windowNavigate).not.toHaveBeenCalled();
  });

  // The transfer consumes the sign-in, so the SignIn route guard is about to bounce `factor-one`
  // to the component's start path. Routing the terminal redirect in-component loses that race and
  // strands the user on a blank sign-in with the session already created.
  it('leaves the component for the terminal redirect when the session has no pending task', async () => {
    const clerk = createMockClerk({ status: 'complete', createdSessionId: 'sess_123' }) as LoadedClerk & {
      setActive: ReturnType<typeof vi.fn>;
    };

    const session = { currentTask: null } as any;
    const decorateUrl = (url: string) => url;

    clerk.setActive.mockImplementation(async params => {
      await params.navigate({ session, decorateUrl });
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect((clerk as any).__internal_windowNavigate).toHaveBeenCalledWith('https://test.com', undefined);
    expect(mockNavigateOnSetActive).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('routes to the combined-flow continue page when sign-up has missing fields', async () => {
    const clerk = createMockClerk({
      status: 'missing_requirements',
      missingFields: ['first_name'],
      unverifiedFields: [],
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toBe('../create/continue');
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
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toBe('../create/verify-email-address');
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
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toBe('../create/verify-phone-number');
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('routes to protect-check when the sign-up is protect-gated', async () => {
    const clerk = createMockClerk({
      status: 'missing_requirements',
      missingFields: ['protect_check', 'first_name'],
      unverifiedFields: [],
    });

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate: mockNavigate,
      afterSignUpUrl: 'https://test.com',
      navigateOnSetActive: mockNavigateOnSetActive,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0] as string).toBe('../create/protect-check');
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
