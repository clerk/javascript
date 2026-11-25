import { test, expect } from '../../fixtures.ts';
import { clientFetchFault, signInWithPassword } from '../../native.ts';

test('a native sign-in reaches the JS hooks when the first client fetch fails', async ({ host, screen, platform }) => {
  const fault = clientFetchFault(screen);
  const user = await host.seedUser({ password: true });
  await host.launch();
  await host.tap(fault.drop);
  await host.tap(host.app.signIn);
  await signInWithPassword(host, screen, platform, user);
  await host.expectSignedInAs(user, 45_000);
  await expect(fault.dropped).toHaveText('1');
  await host.screenshot('signed-in-after-one-failed-fetch');
});
