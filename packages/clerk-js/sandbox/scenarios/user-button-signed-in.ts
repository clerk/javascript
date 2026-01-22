import {
  clerkHandlers,
  EnvironmentService,
  SessionService,
  setClerkState,
  type MockScenario,
  UserService,
} from '@clerk/msw';

export function UserButtonSignedIn(): MockScenario {
  const user = UserService.create();
  const session = SessionService.create(user);

  setClerkState({
    environment: EnvironmentService.MULTI_SESSION,
    session,
    user,
  });

  return {
    description: 'UserButton component with signed-in user',
    handlers: clerkHandlers,
    initialState: { session, user },
    name: 'user-button-signed-in',
  };
}
