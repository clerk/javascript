import type { Locator, Screen } from 'e2e';

import { test, expect } from '../../fixtures.ts';

const TEST_APP_VERSION = '1.0.0';
const IOS = {
  atTheBuild: TEST_APP_VERSION,
  aboveTheBuild: '2.0',
  updateUrl: 'https://apps.apple.com/app/id000000000',
  storeButton: 'Go to App Store',
};
const ANDROID = {
  atTheBuild: '1',
  aboveTheBuild: '2',
  updateUrl: 'https://play.google.com/store/apps/details?id=com.clerk.exponativebuildfixture',
  storeButton: 'Go to Google Play',
};
const minimumsFor = (platform: string) => (platform === 'ios' ? IOS : ANDROID);

// iOS groups the label and the value into one accessibility element, and Android keeps two text nodes.
const yourVersion = (screen: Screen, platform: string): Locator =>
  platform === 'ios' ? screen.getByLabel(`Your version, ${TEST_APP_VERSION}`) : screen.getByText(TEST_APP_VERSION);

test('a signed-in user on a build below the minimum sees the update screen, and is still signed in once the minimum is lowered', async ({
  host,
  screen,
  platform,
}) => {
  const { atTheBuild, aboveTheBuild, updateUrl, storeButton } = minimumsFor(platform);
  const title = screen.getByText('Update required');
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  const sessionId = (await host.app.sessionId.textContent()) ?? '';
  expect(sessionId).not.toBe('');
  await host.evidence(
    'the update screen covers the app, and the same session returns once the minimum is lowered',
    async () => {
      await host.useMinimumAppVersion({ minimumVersion: aboveTheBuild, updateUrl });
      await host.launch({ keepStorage: true, landsOn: title });
      await expect(yourVersion(screen, platform)).toBeVisible();
      await expect(screen.getByText(storeButton)).toBeVisible();
      await host.screenshot('update-required');

      await host.useMinimumAppVersion({ minimumVersion: atTheBuild, updateUrl });
      await host.launch({ keepStorage: true, landsOn: host.app.signedIn });
      await host.expectSignedInAs(user);
      await expect(host.app.sessionId).toHaveText(sessionId);
      await expect(title).toBeHidden();
      await host.screenshot('signed-in-after-lowering');
    },
  );
});

test('a signed-out user on a build below the minimum sees the update screen', async ({ host, screen, platform }) => {
  const { aboveTheBuild, updateUrl } = minimumsFor(platform);
  await host.useMinimumAppVersion({ minimumVersion: aboveTheBuild, updateUrl });
  await host.launch({ landsOn: screen.getByText('Update required') });
  await expect(yourVersion(screen, platform)).toBeVisible();
  await host.screenshot('update-required-signed-out');
});

test('a build at the minimum opens as usual', async ({ host, screen, platform }) => {
  const { atTheBuild, updateUrl } = minimumsFor(platform);
  await host.useMinimumAppVersion({ minimumVersion: atTheBuild, updateUrl });
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await expect(screen.getByText('Update required')).toBeHidden();
});
