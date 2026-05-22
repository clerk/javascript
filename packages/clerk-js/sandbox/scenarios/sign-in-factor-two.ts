import { clerkHandlers, EnvironmentService, setClerkState, SignInService, type MockScenario } from '@clerk/msw';

const mfaEnvironment = {
  ...EnvironmentService.SINGLE_SESSION,
  config: {
    ...EnvironmentService.SINGLE_SESSION.config,
    user_settings: {
      ...EnvironmentService.SINGLE_SESSION.config.user_settings,
      sign_in: {
        second_factor: {
          enabled: true,
          required: false,
        },
      },
    },
  },
};

export function SignInFactorTwoTOTP(): MockScenario {
  setClerkState({
    environment: mfaEnvironment,
    session: null,
    user: null,
  });

  SignInService.createSignInResponse({
    status: 'needs_second_factor',
    identifier: 'user@example.com',
    supportedSecondFactors: [{ strategy: 'totp' }, { strategy: 'backup_code' }],
  });

  return {
    description: 'Sign-in at factor-two step with TOTP strategy',
    handlers: clerkHandlers,
    name: 'sign-in-factor-two-totp',
  };
}

export function SignInFactorTwoBackupCode(): MockScenario {
  setClerkState({
    environment: mfaEnvironment,
    session: null,
    user: null,
  });

  SignInService.createSignInResponse({
    status: 'needs_second_factor',
    identifier: 'user@example.com',
    supportedSecondFactors: [{ strategy: 'backup_code' }, { strategy: 'totp' }],
  });

  return {
    description: 'Sign-in at factor-two step with backup code strategy',
    handlers: clerkHandlers,
    name: 'sign-in-factor-two-backup-code',
  };
}
