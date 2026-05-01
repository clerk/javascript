import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'error handling tests for @tanstack-react-start',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test('request with invalid Authorization header is handled gracefully', async () => {
      const url = new URL('/me', app.serverUrl);
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: 'Bearer invalid_token_here',
        },
      });

      // Clerk middleware treats an invalid bearer token as unauthenticated (not a crash)
      expect(res.status).toBe(200);
    });

    test('request with malformed cookie is handled gracefully', async () => {
      const url = new URL('/me', app.serverUrl);
      const res = await fetch(url.toString(), {
        headers: {
          Cookie: '__session=malformed_jwt_value; __client_uat=0',
        },
      });

      // Clerk middleware handles malformed cookies gracefully, treating the request as unauthenticated
      expect(res.status).toBe(200);
    });
  },
);
