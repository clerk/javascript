import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils';
import { registerApiKeyAuthTests, registerM2MAuthTests, registerOAuthAuthTests } from '../../testUtils';

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.tanstack.reactStart,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config.addFile(
        'src/routes/api/me.ts',
        () => `
        import { createFileRoute } from '@tanstack/react-router'
        import { auth } from '@clerk/tanstack-react-start/server'

        export const Route = createFileRoute('/api/me')({
          server: {
            handlers: {
              GET: async () => {
                const { userId, tokenType } = await auth({ acceptsToken: 'api_key' });

                if (!userId) {
                  return Response.json({ error: 'Unauthorized' }, { status: 401 });
                }

                return Response.json({ userId, tokenType });
              },
              POST: async () => {
                const authObject = await auth({ acceptsToken: ['api_key', 'session_token'] });

                if (!authObject.isAuthenticated) {
                  return Response.json({ error: 'Unauthorized' }, { status: 401 });
                }

                return Response.json({ userId: authObject.userId, tokenType: authObject.tokenType });
              },
            },
          },
        })
        `,
      ),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config.addFile(
        'src/routes/api/m2m.ts',
        () => `
        import { createFileRoute } from '@tanstack/react-router'
        import { auth } from '@clerk/tanstack-react-start/server'

        export const Route = createFileRoute('/api/m2m')({
          server: {
            handlers: {
              GET: async () => {
                const { subject, tokenType, isAuthenticated } = await auth({ acceptsToken: 'm2m_token' });

                if (!isAuthenticated) {
                  return Response.json({ error: 'Unauthorized' }, { status: 401 });
                }

                return Response.json({ subject, tokenType });
              },
            },
          },
        })
        `,
      ),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'src/routes/api/oauth-verify.ts',
          () => `
          import { createFileRoute } from '@tanstack/react-router'
          import { auth } from '@clerk/tanstack-react-start/server'

          export const Route = createFileRoute('/api/oauth-verify')({
            server: {
              handlers: {
                GET: async () => {
                  const { userId, tokenType } = await auth({ acceptsToken: 'oauth_token' });

                  if (!userId) {
                    return Response.json({ error: 'Unauthorized' }, { status: 401 });
                  }

                  return Response.json({ userId, tokenType });
                },
              },
            },
          })
          `,
        )
        .addFile(
          'src/routes/api/oauth/callback.ts',
          () => `
          import { createFileRoute } from '@tanstack/react-router'

          export const Route = createFileRoute('/api/oauth/callback')({
            server: {
              handlers: {
                GET: async () => {
                  return Response.json({ message: 'OAuth callback received' });
                },
              },
            },
          })
          `,
        ),
  },
};

test.describe('TanStack React Start machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
