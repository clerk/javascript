import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils';
import { registerApiKeyAuthTests, registerM2MAuthTests, registerOAuthAuthTests } from '../../testUtils';

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.reactRouter.reactRouterNode,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config
        .addFile(
          'app/routes/api/me.ts',
          () => `
          import { getAuth } from '@clerk/react-router/server';
          import type { Route } from './+types/me';

          export async function loader(args: Route.LoaderArgs) {
            const { userId, tokenType } = await getAuth(args, { acceptsToken: 'api_key' });

            if (!userId) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return Response.json({ userId, tokenType });
          }

          export async function action(args: Route.ActionArgs) {
            const authObject = await getAuth(args, { acceptsToken: ['api_key', 'session_token'] });

            if (!authObject.isAuthenticated) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return Response.json({ userId: authObject.userId, tokenType: authObject.tokenType });
          }
          `,
        )
        .addFile(
          'app/routes.ts',
          () => `
          import { type RouteConfig, index, route } from '@react-router/dev/routes';

          export default [
            index('routes/home.tsx'),
            route('sign-in/*', 'routes/sign-in.tsx'),
            route('sign-up/*', 'routes/sign-up.tsx'),
            route('protected', 'routes/protected.tsx'),
            route('api/me', 'routes/api/me.ts'),
          ] satisfies RouteConfig;
          `,
        ),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config
        .addFile(
          'app/routes/api/m2m.ts',
          () => `
          import { getAuth } from '@clerk/react-router/server';
          import type { Route } from './+types/m2m';

          export async function loader(args: Route.LoaderArgs) {
            const { subject, tokenType, isAuthenticated } = await getAuth(args, { acceptsToken: 'm2m_token' });

            if (!isAuthenticated) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return Response.json({ subject, tokenType });
          }
          `,
        )
        .addFile(
          'app/routes.ts',
          () => `
          import { type RouteConfig, index, route } from '@react-router/dev/routes';

          export default [
            index('routes/home.tsx'),
            route('sign-in/*', 'routes/sign-in.tsx'),
            route('sign-up/*', 'routes/sign-up.tsx'),
            route('protected', 'routes/protected.tsx'),
            route('api/m2m', 'routes/api/m2m.ts'),
          ] satisfies RouteConfig;
          `,
        ),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'app/routes/api/oauth-verify.ts',
          () => `
          import { getAuth } from '@clerk/react-router/server';
          import type { Route } from './+types/oauth-verify';

          export async function loader(args: Route.LoaderArgs) {
            const { userId, tokenType } = await getAuth(args, { acceptsToken: 'oauth_token' });

            if (!userId) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return Response.json({ userId, tokenType });
          }
          `,
        )
        .addFile(
          'app/routes/api/oauth-callback.ts',
          () => `
          export async function loader() {
            return Response.json({ message: 'OAuth callback received' });
          }
          `,
        )
        .addFile(
          'app/routes.ts',
          () => `
          import { type RouteConfig, index, route } from '@react-router/dev/routes';

          export default [
            index('routes/home.tsx'),
            route('sign-in/*', 'routes/sign-in.tsx'),
            route('sign-up/*', 'routes/sign-up.tsx'),
            route('protected', 'routes/protected.tsx'),
            route('api/oauth-verify', 'routes/api/oauth-verify.ts'),
            route('api/oauth/callback', 'routes/api/oauth-callback.ts'),
          ] satisfies RouteConfig;
          `,
        ),
  },
};

test.describe('React Router machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
