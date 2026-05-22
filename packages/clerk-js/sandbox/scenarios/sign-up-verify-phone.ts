import { clerkHandlers, EnvironmentService, setClerkState, SignUpService, type MockScenario } from '@clerk/msw';

export function SignUpVerifyPhone(): MockScenario {
  setClerkState({
    environment: EnvironmentService.SINGLE_SESSION,
    session: null,
    user: null,
  });

  const signUp = SignUpService.createSignUpResponse({
    status: 'missing_requirements',
    email: 'user@example.com',
    unverifiedFields: ['phone_number'],
    verificationAttempts: 0,
    verificationStatus: 'unverified',
  });
  signUp.phone_number = '+12025551234';

  return {
    description: 'Sign-up at phone verification step',
    handlers: clerkHandlers,
    name: 'sign-up-verify-phone',
  };
}
