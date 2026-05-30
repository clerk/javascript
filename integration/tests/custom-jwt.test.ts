import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('Custom JWT templates @nextjs', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser;
  let jwtTemplateId: string;
  const jwtTemplateName = `e2e-test-${Date.now()}`;

  test.beforeAll(async () => {
    test.setTimeout(120_000);

    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/middleware.ts',
        () => `import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
`,
      )
      .addFile(
        'src/app/api/custom-jwt/route.ts',
        () => `import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const headersList = await headers();
  const templateName = headersList.get('x-jwt-template');
  const { getToken, userId, sessionId } = await auth();
  // Always returns a valid, freshly issued token
  const customToken = await getToken({ template: '${jwtTemplateName}' });
  return Response.json({
    userId,
    sessionId,
    customToken,
  });
}`,
      )
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
    await m.services.users.createBapiUser(fakeUser);

    const template = await m.services.clerk.jwtTemplates.create({
      name: jwtTemplateName,
      claims: { test_claim: 'hello_from_e2e' },
      lifetime: 60,
    });
    jwtTemplateId = template.id;
  });

  test.afterAll(async () => {
    const m = createTestUtils({ app });
    if (jwtTemplateId) {
      await m.services.clerk.jwtTemplates.delete(jwtTemplateId);
    }
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('getToken with skipCache returns a fresh custom JWT token on each call', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    const fetchToken = () => page.request.get(`${app.serverUrl}/api/custom-jwt`);

    const res1 = await fetchToken();
    expect(res1.status()).toBe(200);
    const body1 = await res1.json();
    expect(body1.userId).toBeTruthy();
    expect(body1.sessionId).toBeTruthy();
    expect(body1.customToken).toBeTruthy();

    const payload1 = JSON.parse(atob(body1.customToken.split('.')[1]));
    expect(payload1.test_claim).toBe('hello_from_e2e');

    // Wait >1s so the next token gets a different `iat` (seconds granularity)
    await page.waitForTimeout(1500);

    const res2 = await fetchToken();
    expect(res2.status()).toBe(200);
    const body2 = await res2.json();
    expect(body2.userId).toBeTruthy();
    expect(body2.sessionId).toBeTruthy();
    expect(body2.customToken).toBeTruthy();

    const payload2 = JSON.parse(atob(body2.customToken.split('.')[1]));
    expect(payload2.test_claim).toBe('hello_from_e2e');
    expect(payload2.iat).toBeGreaterThan(payload1.iat);
  });
});
