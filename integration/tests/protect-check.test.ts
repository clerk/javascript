import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const challengeUrl = 'https://protect-check.e2e.clerk.test/challenge.js';
const proofToken = 'e2e-proof-token';

const challengeScript = `
export default async function (container, { setWidgetVisible }) {
  await setWidgetVisible(true);
  const button = document.createElement('button');
  button.textContent = 'Complete challenge';
  container.appendChild(button);
  await new Promise(resolve => button.addEventListener('click', resolve, { once: true }));
  return '${proofToken}';
}
`;

const gateNextCreate = async (page: Page, resource: 'sign_in' | 'sign_up') => {
  const endpoint = `/v1/client/${resource}s`;
  const submittedProofs: string[] = [];
  let ungated: { headers: Record<string, string>; body: unknown } | undefined;

  await page.route(challengeUrl, route =>
    route.fulfill({
      contentType: 'text/javascript',
      headers: { 'access-control-allow-origin': '*' },
      body: challengeScript,
    }),
  );

  await page.route(
    url => url.pathname.endsWith(endpoint),
    async route => {
      if (route.request().method() !== 'POST') {
        return route.fallback();
      }
      const response = await route.fetch();
      const body = await response.json();
      ungated = { headers: response.headers(), body: structuredClone(body) };

      const protectCheck = { status: 'pending', token: 'e2e-challenge-token', sdk_url: challengeUrl };
      body.response.protect_check = protectCheck;
      body.client[resource].protect_check = protectCheck;
      await route.fulfill({ response, json: body });
    },
    { times: 1 },
  );

  await page.route(
    url => url.pathname.includes(`${endpoint}/`) && url.pathname.endsWith('/protect_check'),
    async route => {
      submittedProofs.push(route.request().postDataJSON().proof_token);
      await route.fulfill({ status: 200, headers: ungated!.headers, json: ungated!.body });
    },
  );

  return submittedProofs;
};

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('protect check @generic', ({ app }) => {
  let fakeUser: FakeUser | undefined;

  test.afterEach(async () => {
    await fakeUser?.deleteIfExists();
    fakeUser = undefined;
  });

  test('sign-up completes the challenge and continues to email verification', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    const submittedProofs = await gateNextCreate(page, 'sign_up');

    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email!, password: fakeUser.password });

    await expect(u.page.getByText('Verifying your request')).toBeVisible();
    await u.page.getByRole('button', { name: 'Complete challenge' }).click();

    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
    expect(submittedProofs).toEqual([proofToken]);
  });

  test('sign-in completes the challenge and continues to the first factor', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    await u.services.users.createBapiUser(fakeUser);
    const submittedProofs = await gateNextCreate(page, 'sign_in');

    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email!);
    await u.po.signIn.continue();

    await expect(u.page.getByText('Verifying your request')).toBeVisible();
    await u.page.getByRole('button', { name: 'Complete challenge' }).click();

    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
    expect(submittedProofs).toEqual([proofToken]);
  });
});
