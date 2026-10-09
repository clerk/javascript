import {
  clerkHandlers,
  EnvironmentService,
  type MockScenario,
  SessionService,
  setClerkState,
  UserService,
} from '@clerk/msw';

export function AgentActionApproval(): MockScenario {
  const user = UserService.create();
  const session = SessionService.create(user);

  setClerkState({
    environment: EnvironmentService.MULTI_SESSION,
    session,
    user,
  });

  return {
    description: 'Interactive agent-action approval prototype',
    handlers: clerkHandlers,
    initialState: { session, user },
    name: 'agent-action-approval',
  };
}
