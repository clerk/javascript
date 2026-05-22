import { clerkHandlers, EnvironmentService, setClerkState, SignInService, type MockScenario } from '@clerk/msw';

export function SignInFactorOnePassword(): MockScenario {
  setClerkState({
    environment: EnvironmentService.SINGLE_SESSION,
    session: null,
    user: null,
  });

  SignInService.createSignInResponse({
    status: 'needs_first_factor',
    firstFactorStrategy: 'password',
    identifier: 'user@example.com',
  });

  return {
    description: 'Sign-in at factor-one step with password strategy',
    handlers: clerkHandlers,
    name: 'sign-in-factor-one-password',
  };
}

export function SignInFactorOneEmailCode(): MockScenario {
  setClerkState({
    environment: EnvironmentService.SINGLE_SESSION,
    session: null,
    user: null,
  });

  SignInService.createSignInResponse({
    status: 'needs_first_factor',
    firstFactorStrategy: 'email_code',
    identifier: 'user@example.com',
  });

  return {
    description: 'Sign-in at factor-one step with email code strategy',
    handlers: clerkHandlers,
    name: 'sign-in-factor-one-email-code',
  };
}

export function SignInFactorOnePhoneCode(): MockScenario {
  setClerkState({
    environment: EnvironmentService.SINGLE_SESSION,
    session: null,
    user: null,
  });

  SignInService.createSignInResponse({
    status: 'needs_first_factor',
    firstFactorStrategy: 'phone_code',
    identifier: '+1********00',
  });

  return {
    description: 'Sign-in at factor-one step with phone code strategy',
    handlers: clerkHandlers,
    name: 'sign-in-factor-one-phone-code',
  };
}
