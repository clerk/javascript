import { SignUpResource } from '@clerk/types';

import { completeSignUpFlow } from './util';

const mockHandleComplete = jest.fn();
const mockNavigate = jest.fn();

describe('completeSignUpFlow', () => {
  beforeEach(() => {
    mockHandleComplete.mockReset();
    mockNavigate.mockReset();
  });

  it('calls handleComplete if sign up is complete', async () => {
    const mockSignUp = {
      status: 'complete',
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to verify email page if email still unverified', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      unverifiedFields: ['email_address', 'phone_number'],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-email');
  });

  it('navigates to verify phone page if phone still unverified', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      unverifiedFields: ['phone_number'],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyPhonePath: 'verify-phone',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-phone');
  });

  it('does nothing in any other case', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
