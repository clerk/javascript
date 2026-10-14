import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

test('the token cache keeps the session across a relaunch, and a new scope starts signed out', async ({
  host,
  screen,
}) => {
  const clientToken = screen.getByTestId('verify.tokenCache.clientToken');
  const cachedUser = screen.getByTestId('verify.tokenCache.user');
  const tokenCache = homeLinks(screen).tokenCache;
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  const session = (await host.app.sessionId.textContent()) ?? '';

  await host.launch({ keepStorage: true, landsOn: host.app.signedIn });
  await host.expectSignedInAs(user);
  await expect(host.app.sessionId).toHaveText(session);
  await host.screenshot('restored-home');

  await host.tap(tokenCache);
  await expect(clientToken).toHaveText('client token kept from the last launch: yes', { timeout: 15_000 });
  await expect(cachedUser).toHaveText(`user: ${user.id}`, { timeout: 15_000 });
  await host.screenshot('token-cache');

  await host.launch();
  await host.tap(tokenCache);
  await expect(clientToken).toHaveText('client token kept from the last launch: no', { timeout: 15_000 });
  await expect(cachedUser).toHaveText('user: none', { timeout: 15_000 });
  await host.screenshot('new-scope');
});
