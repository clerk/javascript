import { expect, expectSignedIn, expectSignedOut, openApp, signInWithEmailPassword, tapControl, test } from './flows';

// Embedded UserProfileView (onHostBack): internal navigation stays native, and
// the host-supplied root back button closes the screen from JS.
test('Embedded UserProfileView host back round trip', async ({ device, platform }) => {
  await openApp(device);
  await device.getByTestId('open-auth-view-button').tap();
  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);
  await device.getByTestId('open-embedded-profile-button').tap();

  // The internal push differs per platform: clerk-ios pushes a Security screen
  // from the profile root, clerk-android uses tabs at the root and pushes the
  // Manage account screen instead. The double-Back contract below is the same:
  // both back buttons read 'Back' but only one exists at a time, so the first
  // tap pops Clerk's internal stack and the second is the host chevron firing
  // onHostBack.
  const ios = platform === 'ios';
  const root = ios ? 'Security' : 'Edit profile';
  const row = ios ? 'Security' : 'Manage account';
  // A section heading the pushed screen has and the profile root does not.
  const pushed = ios ? 'PASSWORD' : 'EMAIL ADDRESSES';

  // Exact throughout: these rows sit next to an icon whose label repeats the row
  // name ('Security' is a substring of 'icon-security'), and the pushed screen
  // repeats its heading in the controls underneath it.
  await expect(device.getByText(root, { exact: true })).toBeVisible({ timeout: 20_000 });
  await tapControl(device, row);
  await expect(device.getByText(pushed, { exact: true })).toBeVisible({ timeout: 15_000 });
  await tapControl(device, 'Back');
  await expect(device.getByText(root, { exact: true })).toBeVisible({ timeout: 15_000 });

  await tapControl(device, 'Back');
  await expect(device.getByTestId('open-embedded-profile-button')).toBeVisible({ timeout: 15_000 });
  await device.getByTestId('sign-out-button').tap();
  await expectSignedOut(device);
});
