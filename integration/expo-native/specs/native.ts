import { expect, type Locator } from 'e2e';
import type { SecretLike, SeededUser } from './support/types.ts';

interface Screen {
  getByTestId(id: string): Locator;
  getByText(text: string | RegExp): Locator;
  getByLabel(text: string): Locator;
  getByRole(role: 'textbox'): Locator;
  getByDisplayValue(value: string): Locator;
  tapAt(point: { x: number; y: number }): Promise<void>;
}

interface Device {
  back(): Promise<void>;
}

interface Host {
  readonly app: { readonly signedIn: Locator };
  tap(target: Locator): Promise<void>;
  fill(target: Locator, text: string | SecretLike): Promise<void>;
}

const CLOSE_TAKES_EFFECT_MS = 3_000;
const PASSWORD_SCREEN_TIMEOUT_MS = 20_000;
const SIGNED_IN_TIMEOUT_MS = 45_000;

export function nativeAuth(screen: Screen, platform: string) {
  const ios = platform === 'ios';
  return {
    identifier: ios
      ? screen.getByTestId('clerk.auth.start.identifier')
      : screen.getByText('Enter your email or username'),
    continue: ios ? screen.getByTestId('clerk.auth.start.continue') : screen.getByText('Continue'),
    passwordLabel: screen.getByText('Enter your password'),
    passwordField: screen.getByRole('textbox').last(),
    passwordContinue: ios ? screen.getByTestId('clerk.auth.signIn.continue') : screen.getByText('Continue'),
  };
}

async function gone(locator: Locator, withinMs: number): Promise<boolean> {
  const deadline = Date.now() + withinMs;
  while ((await locator.count()) > 0) {
    if (Date.now() >= deadline) return false;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return true;
}

export async function closeNativeAuth(screen: Screen, device: Device, platform: string): Promise<void> {
  if (platform !== 'ios') {
    await device.back();
    return;
  }
  const close = screen.getByTestId('clerk.dismissButton').last();
  await close.tap();
  if (!(await gone(close, CLOSE_TAKES_EFFECT_MS))) await close.tap();
}

async function reachPasswordScreen(host: Host, screen: Screen, platform: string, user: SeededUser): Promise<Locator> {
  const auth = nativeAuth(screen, platform);
  await expect(auth.continue).toBeVisible({ timeout: PASSWORD_SCREEN_TIMEOUT_MS });
  const remembered = screen.getByDisplayValue(user.email);
  if ((await remembered.count()) === 0) await host.fill(auth.identifier, user.email);
  await host.tap(auth.continue);
  await expect(auth.passwordLabel.first()).toBeVisible({ timeout: PASSWORD_SCREEN_TIMEOUT_MS });
  await expect(auth.passwordField).toBeVisible();
  return auth.passwordField;
}

async function declineAndroidPasswordManager(screen: Screen, signedIn: Locator): Promise<void> {
  const prompt = screen.getByText(/Google Password Manager/);
  await expect
    .poll(async () => (await prompt.count()) > 0 || (await signedIn.count()) > 0, { timeout: SIGNED_IN_TIMEOUT_MS })
    .toBe(true);
  if ((await prompt.count()) > 0) {
    await screen
      .getByText(/^(Not now|Never)$/i)
      .first()
      .tap();
  }
}

export async function signInWithPassword(
  host: Host,
  screen: Screen,
  platform: string,
  user: SeededUser,
): Promise<void> {
  if (user.password === null) throw new Error('seed the user with host.seedUser({ password: true })');
  const field = await reachPasswordScreen(host, screen, platform, user);
  await host.fill(field, user.password);
  await host.tap(nativeAuth(screen, platform).passwordContinue);
  if (platform === 'android') await declineAndroidPasswordManager(screen, host.app.signedIn);
}

export function homeLinks(screen: Screen) {
  return {
    nativeAuth: screen.getByTestId('e2e.home.nativeAuth'),
    authLogo: screen.getByTestId('e2e.home.authLogo'),
    customSignIn: screen.getByTestId('e2e.home.customSignIn'),
    customSignUp: screen.getByTestId('e2e.home.customSignUp'),
    tokenCache: screen.getByTestId('e2e.home.tokenCache'),
    embeddedProfile: screen.getByTestId('e2e.home.embeddedProfile'),
    nativeModules: screen.getByTestId('e2e.home.nativeModules'),
  };
}

export function nativeUserButton(screen: Screen, platform: string): Locator {
  return platform === 'ios' ? screen.getByTestId('clerk.userButton.profile') : screen.getByLabel('Open user profile');
}

export function nativeProfile(screen: Screen) {
  return {
    manageAccount: screen.getByText('Manage account'),
    signOut: screen.getByText('Sign out'),
  };
}

export function embeddedProfile(screen: Screen) {
  return {
    customPageRow: screen.getByText('E2E Custom Page'),
    customPageBody: screen.getByText('Rehosted RN body'),
  };
}

export async function tapProfileBack(screen: Screen): Promise<void> {
  const back = screen.getByLabel('Back').last();
  await expect(back).toBeVisible();
  const frame = await back.boundingBox();
  if (frame === null) throw new Error('the Back button of the profile has no frame');
  await screen.tapAt({ x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 });
}

export async function leaveCustomPage(screen: Screen, device: Device, platform: string): Promise<void> {
  if (platform === 'ios') await tapProfileBack(screen);
  else await device.back();
}
