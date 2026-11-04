import { test, expect } from '../../fixtures.ts';
import { updateRequiredScreen } from '../../native.ts';

const TEST_APP_VERSION = '1.0.0';
const IOS = {
  atTheBuild: TEST_APP_VERSION,
  aboveTheBuild: '2.0',
  updateUrl: 'https://apps.apple.com/app/id000000000',
};
const ANDROID = {
  atTheBuild: '1',
  aboveTheBuild: '2',
  updateUrl: 'https://play.google.com/store/apps/details?id=com.clerk.exponativebuildfixture',
};
const minimumsFor = (platform: string) => (platform === 'ios' ? IOS : ANDROID);

test('a signed-in user on a build below the minimum sees the update screen, and is still signed in once the minimum is lowered', async ({
  host,
  screen,
  platform,
}) => {
  const { atTheBuild, aboveTheBuild, updateUrl } = minimumsFor(platform);
  const updateRequired = updateRequiredScreen(screen, platform);
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  const sessionId = (await host.app.sessionId.textContent()) ?? '';
  expect(sessionId).not.toBe('');
  await host.evidence(
    'the update screen covers the app, and the same session returns once the minimum is lowered',
    async () => {
      await host.useMinimumAppVersion({ minimumVersion: aboveTheBuild, updateUrl });
      await host.launch({ keepStorage: true, landsOn: updateRequired.title });
      await expect(updateRequired.yourVersion(TEST_APP_VERSION)).toBeVisible();
      if (platform === 'ios') {
        await expect(updateRequired.required(aboveTheBuild)).toBeVisible();
      }
      await expect(updateRequired.storeButton).toBeVisible();
      await host.screenshot('update-required');

      await host.useMinimumAppVersion({ minimumVersion: atTheBuild, updateUrl });
      await host.launch({ keepStorage: true, landsOn: host.app.signedIn });
      await host.expectSignedInAs(user);
      await expect(host.app.sessionId).toHaveText(sessionId);
      await expect(updateRequired.title).toHaveCount(0);
      await host.screenshot('signed-in-after-lowering');
    },
  );
});

test('a signed-out user on a build below the minimum sees the update screen', async ({ host, screen, platform }) => {
  const { aboveTheBuild, updateUrl } = minimumsFor(platform);
  const updateRequired = updateRequiredScreen(screen, platform);
  await host.useMinimumAppVersion({ minimumVersion: aboveTheBuild, updateUrl });
  await host.launch({ landsOn: updateRequired.title });
  await expect(updateRequired.yourVersion(TEST_APP_VERSION)).toBeVisible();
  await host.screenshot('update-required-signed-out');
});

test('a build at the minimum opens as usual', async ({ host, screen, platform }) => {
  const { atTheBuild, updateUrl } = minimumsFor(platform);
  await host.useMinimumAppVersion({ minimumVersion: atTheBuild, updateUrl });
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await expect(updateRequiredScreen(screen, platform).title).toHaveCount(0);
});
