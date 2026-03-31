import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils';
import { registerApiKeyAuthTests, registerM2MAuthTests, registerOAuthAuthTests } from '../../testUtils';

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.astro.node,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config.addFile(
        'src/pages/api/me.ts',
        () => `
        import type { APIRoute } from 'astro';

        export const GET: APIRoute = ({ locals }) => {
          const { userId, tokenType } = locals.auth({ acceptsToken: 'api_key' });

          if (!userId) {
            return new Response('Unauthorized', { status: 401 });
          }

          return Response.json({ userId, tokenType });
        };

        export const POST: APIRoute = ({ locals }) => {
          const authObject = locals.auth({ acceptsToken: ['api_key', 'session_token'] });

          if (!authObject.isAuthenticated) {
            return new Response('Unauthorized', { status: 401 });
          }

          return Response.json({ userId: authObject.userId, tokenType: authObject.tokenType });
        };
        `,
      ),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config.addFile(
        'src/pages/api/m2m.ts',
        () => `
        import type { APIRoute } from 'astro';

        export const GET: APIRoute = ({ locals }) => {
          const { subject, tokenType, isAuthenticated } = locals.auth({ acceptsToken: 'm2m_token' });

          if (!isAuthenticated) {
            return new Response('Unauthorized', { status: 401 });
          }

          return Response.json({ subject, tokenType });
        };
        `,
      ),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'src/pages/api/oauth-verify.ts',
          () => `
          import type { APIRoute } from 'astro';

          export const GET: APIRoute = ({ locals }) => {
            const { userId, tokenType } = locals.auth({ acceptsToken: 'oauth_token' });

            if (!userId) {
              return new Response('Unauthorized', { status: 401 });
            }

            return Response.json({ userId, tokenType });
          };
          `,
        )
        .addFile(
          'src/pages/api/oauth/callback.ts',
          () => `
          import type { APIRoute } from 'astro';

          export const GET: APIRoute = () => {
            return Response.json({ message: 'OAuth callback received' });
          };
          `,
        ),
  },
};

test.describe('Astro machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
