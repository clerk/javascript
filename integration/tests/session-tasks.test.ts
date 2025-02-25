import { appConfigs } from '../presets';
import { testAgainstRunningApps } from '../testUtils';

// TODO ORGS-566 - Write integration tests for after-auth flow
testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('after-auth flows @generic @nextjs', () => {
  describe('after sign-in', () => {
    // /sign-in -> /sign-in/select-organization
    it.todo('navigates to tasks');

    // /sign-in -> /sign-in/select-organization -> /app (after-sign-in URL)
    it.todo('navigates to after-sign-in URL when tasks get resolved');

    // with session status pending -> accesses /sign-in -> redirects to /sign-in/select-organization
    it.todo('on single-session mode, sign-in redirects back to tasks when accessed with a pending session');
  });

  describe('after sign-up', () => {
    // /sign-up -> /sign-up/select-organization
    it.todo('navigates to tasks');

    // /sign-up -> /sign-up/select-organization -> /app/welcome (after-sign-up URL)
    it.todo('navigates to after-sign-up URL when tasks get resolved');

    // with session status pending -> accesses /sign-up -> redirects to /sign-up/select-organization
    it.todo('on single-session mode, sign-up redirects back to tasks when accessed with a pending session');
  });

  describe('when user is using the app and session transitions to active to pending', () => {
    // /my-dashboard/recipes -> /sign-in/select-organization
    it.todo('on session transition to pending with tasks, redirects to tasks');

    // /my-dashboard/recipes -> /sign-in/select-organization -> /my-dashboard/recipes
    it.todo('navigates to middle app origin when tasks get resolved');
  });
});
