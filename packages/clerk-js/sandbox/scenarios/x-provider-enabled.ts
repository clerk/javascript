import { clerkHandlers, EnvironmentService, type MockScenario, setClerkState } from '@clerk/msw';

/**
 * Signed-out sign-in page with the X / Twitter social provider enabled.
 *
 * The shared sandbox instance does not have X enabled, so this scenario mocks
 * the environment to add it — useful for verifying the X provider logo (e.g. how
 * it renders in dark mode). Activate it from the console with:
 *
 *   scenario.setScenario('XProviderEnabled')
 */
export function XProviderEnabled(): MockScenario {
  const environment = structuredClone(EnvironmentService.SINGLE_SESSION);

  environment.config.user_settings.social = {
    ...environment.config.user_settings.social,
    oauth_x: {
      authenticatable: true,
      enabled: true,
      logo_url: '',
      name: 'X / Twitter',
      required: false,
      strategy: 'oauth_x',
    },
  };

  setClerkState({ environment, session: null });

  return {
    description: 'Sign-in page with the X / Twitter social provider enabled',
    handlers: clerkHandlers,
    name: 'x-provider-enabled',
  };
}
