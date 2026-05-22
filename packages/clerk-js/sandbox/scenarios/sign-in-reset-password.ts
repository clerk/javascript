import { clerkHandlers, EnvironmentService, setClerkState, SignInService, type MockScenario } from '@clerk/msw';

export function SignInResetPassword(): MockScenario {
  setClerkState({
    environment: EnvironmentService.SINGLE_SESSION,
    session: null,
    user: null,
  });

  const signIn = SignInService.createSignInResponse({
    status: 'needs_first_factor',
    firstFactorStrategy: 'email_code',
    identifier: 'user@example.com',
  });

  signIn.supported_first_factors.push({
    email_address_id: 'idn_mock_email',
    primary: true,
    safe_identifier: 'user@example.com',
    strategy: 'reset_password_email_code',
  } as any);

  return {
    description: 'Sign-in at reset password step',
    handlers: clerkHandlers,
    name: 'sign-in-reset-password',
  };
}
