import { clerkHandlers, EnvironmentService, setClerkState, SignUpService, type MockScenario } from '@clerk/msw';

export function SignUpVerifyEmail(): MockScenario {
  setClerkState({
    environment: EnvironmentService.SINGLE_SESSION,
    session: null,
    user: null,
  });

  SignUpService.createSignUpResponse({
    status: 'missing_requirements',
    email: 'user@example.com',
    unverifiedFields: ['email_address'],
    verificationAttempts: 0,
    verificationStatus: 'unverified',
  });

  return {
    description: 'Sign-up at email verification step',
    handlers: clerkHandlers,
    name: 'sign-up-verify-email',
  };
}
