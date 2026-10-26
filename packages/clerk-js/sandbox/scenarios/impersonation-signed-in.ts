import {
  clerkHandlers,
  EnvironmentService,
  type MockScenario,
  SessionService,
  setClerkState,
  UserService,
} from '@clerk/msw';

export function ImpersonationSignedIn(): MockScenario {
  const user = UserService.create();
  const session = { ...SessionService.create(user), actor: { sub: 'user_impersonator' } };

  setClerkState({
    environment: EnvironmentService.MULTI_SESSION,
    session,
    user,
  });

  return {
    description: 'Signed-in session impersonated by another user, showing the impersonation button',
    handlers: clerkHandlers,
    initialState: { session, user },
    name: 'impersonation-signed-in',
  };
}
