import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { MachineAuthTestAdapter } from '../testUtils';
import { registerApiKeyAuthTests, registerM2MAuthTests, registerOAuthAuthTests } from '../testUtils';

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.next.appRouter,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config.addFile(
        'src/app/api/me/route.ts',
        () => `
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId, tokenType } = await auth({ acceptsToken: 'api_key' });

          if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ userId, tokenType });
        }

        export async function POST() {
          const authObject = await auth({ acceptsToken: ['api_key', 'session_token'] });

          if (!authObject.isAuthenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ userId: authObject.userId, tokenType: authObject.tokenType });
        }
        `,
      ),
  },
  m2m: {
    path: '/api/protected',
    addRoutes: config =>
      config.addFile(
        'src/app/api/protected/route.ts',
        () => `
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { subject, tokenType, isAuthenticated } = await auth({ acceptsToken: 'm2m_token' });

          if (!isAuthenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ subject, tokenType });
        }
        `,
      ),
  },
  oauth: {
    verifyPath: '/api/protected',
    callbackPath: '/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'src/app/api/protected/route.ts',
          () => `
          import { auth } from '@clerk/nextjs/server';

          export async function GET() {
            const { userId, tokenType } = await auth({ acceptsToken: 'oauth_token' });

            if (!userId) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return Response.json({ userId, tokenType });
          }
          `,
        )
        .addFile(
          'src/app/oauth/callback/route.ts',
          () => `
          import { NextResponse } from 'next/server';

          export async function GET() {
            return NextResponse.json({ message: 'OAuth callback received' });
          }
          `,
        ),
  },
};

test.describe('Next.js machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
