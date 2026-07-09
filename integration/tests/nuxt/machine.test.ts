import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils/machineAuthHelpers';
import {
  registerApiKeyAuthTests,
  registerM2MAuthTests,
  registerOAuthAuthTests,
} from '../../testUtils/machineAuthHelpers';

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.nuxt.node,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config
        .addFile(
          'server/api/me.get.ts',
          () => `
          export default eventHandler(event => {
            const { userId, tokenType } = event.context.auth({ acceptsToken: 'api_key' });

            if (!userId) {
              throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
            }

            return { userId, tokenType };
          });
          `,
        )
        .addFile(
          'server/api/me.post.ts',
          () => `
          export default eventHandler(event => {
            const authObject = event.context.auth({ acceptsToken: ['api_key', 'session_token'] });

            if (!authObject.isAuthenticated) {
              throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
            }

            return { userId: authObject.userId, tokenType: authObject.tokenType };
          });
          `,
        ),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config.addFile(
        'server/api/m2m.get.ts',
        () => `
        export default eventHandler(event => {
          const { subject, tokenType, isAuthenticated } = event.context.auth({ acceptsToken: 'm2m_token' });

          if (!isAuthenticated) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
          }

          return { subject, tokenType };
        });
        `,
      ),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'server/api/oauth-verify.get.ts',
          () => `
          export default eventHandler(event => {
            const { userId, tokenType } = event.context.auth({ acceptsToken: 'oauth_token' });

            if (!userId) {
              throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
            }

            return { userId, tokenType };
          });
          `,
        )
        .addFile(
          'server/api/oauth/callback.get.ts',
          () => `
          export default eventHandler(() => {
            return { message: 'OAuth callback received' };
          });
          `,
        ),
  },
};

test.describe('Nuxt machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
