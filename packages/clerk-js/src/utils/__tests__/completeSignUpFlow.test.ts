import type { SignUpField, SignUpResource } from '@clerk/types';

import { completeSignUpFlow } from '../completeSignUpFlow';

const mockHandleComplete = jest.fn();
const mockNavigate = jest.fn();
const mockAuthenticateWithRedirect = jest.fn();

describe('completeSignUpFlow', () => {
  beforeEach(() => {
    mockHandleComplete.mockReset();
    mockNavigate.mockReset();
    mockAuthenticateWithRedirect.mockReset();
  });

  it('calls handleComplete if sign up is complete', async () => {
    const mockSignUp = {
      status: 'complete',
      missingFields: [] as SignUpField[],
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
      missingFields: [] as SignUpField[],
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
      missingFields: [] as SignUpField[],
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
      missingFields: [] as SignUpField[],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('initiates a SAML flow if saml is listed as a missing field', async () => {
    const redirectUrl = 'https://www.in.gr/acs';
    const redirectUrlComplete = 'https://www.in.gr/tada';

    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['saml'],
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    } as unknown as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
      redirectUrl: 'https://www.in.gr/acs',
      redirectUrlComplete: 'https://www.in.gr/tada',
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: true,
    });
  });

  it('initiates a Enterprise SSO flow if enterprise_sso is listed as a missing field', async () => {
    const redirectUrl = 'https://www.in.gr/acs';
    const redirectUrlComplete = 'https://www.in.gr/tada';

    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['enterprise_sso'],
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    } as unknown as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
      redirectUrl: 'https://www.in.gr/acs',
      redirectUrlComplete: 'https://www.in.gr/tada',
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: true,
    });
  });
});
