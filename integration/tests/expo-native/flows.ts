/**
 * The pieces every spec shares.
 *
 * clerk-android ships no testTag or resource-ids and both native SDKs localize
 * every string, so shared selectors are English text and accessibility labels
 * and the devices have to run the en locale. clerk-ios does expose accessibility
 * identifiers, and the two fields below use them because a SwiftUI text field is
 * otherwise unreachable until something focuses it.
 */

import type { Device, Locator, Platform } from 'touchpress';
import { expect, test } from 'touchpress';

export { expect, test };

function credentials(): { email: string; password: string } {
  const email = process.env.CLERK_TEST_EMAIL;
  const password = process.env.CLERK_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error('CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD are required');
  }
  return { email, password };
}

/** Launch from a clean state and land signed out. */
export async function openApp(device: Device): Promise<void> {
  await device.clearKeychain();
  await device.clearState();
  await expectSignedOut(device, 45_000);
}

/**
 * The JS layer observed the native sign-in, which is the bridge doing its job.
 *
 * The budget spans a sign-in round trip, the native-to-JS sync and the sheet
 * dismissing. Until it dismisses, `auth-state` is not in the visible tree at
 * all, so a short budget here reads as 'no node matched' rather than as the
 * slow network it is.
 */
export async function expectSignedIn(device: Device, timeout = 60_000): Promise<void> {
  await expect(device.getByTestId('auth-state')).toHaveText('signed in', { exact: true, timeout });
  await expect(device.getByTestId('user-id')).toBeVisible();
}

export async function expectSignedOut(device: Device, timeout = 20_000): Promise<void> {
  await expect(device.getByTestId('auth-state')).toHaveText('signed out', { exact: true, timeout });
}

/** Enter email and password into the native AuthView and submit. */
export async function signInWithEmailPassword(device: Device, platform: Platform | undefined): Promise<void> {
  const { email, password } = credentials();

  await expect(device.getByText(/Welcome! Sign in to continue\.?/)).toBeVisible({ timeout: 25_000 });
  // The AuthView can render its welcome copy a beat before the email field.
  // The placeholder varies by instance config (email-only vs email+username).
  const identifierPlaceholder = device.getByText(/Enter your email( or username)?/);
  await expect(identifierPlaceholder).toBeVisible({ timeout: 25_000 });

  // On iOS the field itself is missing from the accessibility tree until it is
  // focused: SwiftUI animates it to near-zero opacity rather than removing it,
  // and an element that faint is left out. The placeholder is what carries the
  // identifier meanwhile, so tapping it is what makes the field appear.
  await identifierPlaceholder.tap();
  await identifierField(device, platform).fill(email);
  await expect(device.getByText(email)).toBeVisible({ timeout: 10_000 });
  await tapControl(device, 'Continue');

  // Which first factor comes next depends on the instance config and on the
  // SDK: clerk-ios can go email-code-first where clerk-android goes
  // password-first. Accept either screen.
  await expect(device.getByText(/Enter your password|Check your email/)).toBeVisible({ timeout: 15_000 });

  // Email-link-first instances cannot be automated, so switch strategy. Never
  // taken on the CI instance, and kept for the dev instances that do offer it.
  if (await isVisible(device.getByText('Open email app'))) {
    await tapControl(device, 'Use another method');
    await tapControl(device, 'Sign in with your password');
  }
  await submitEmailCode(device);

  if (await isVisible(device.getByText('Enter your password'))) {
    await device.getByText('Enter your password').tap();
    await passwordField(device, platform).fill(password, { secret: true });
    await tapControl(device, 'Continue');
    // The screen stays stable while the request is in flight, so the settle
    // after the tap can return before the next screen exists. Either outcome
    // ends the wait, and neither one failing is itself a failure: the spec's
    // own assertion is what decides.
    await expect(device.getByText(/Check your email|signed in/))
      .toBeVisible({ timeout: 15_000 })
      .catch(() => undefined);
  }
  // Some instances ask for the email code after the password instead.
  await submitEmailCode(device);

  // Android's Google Password Manager offers to save the password.
  await dismissIfPresent(device.getByText(/Google Password Manager/), device.getByText(/Not now|Never/));
  // The iOS system Save Password sheet overlays the app.
  await dismissIfPresent(
    device.getByText(/Save Password|Strong Password|Use Strong Password|AutoFill Passwords/),
    device.getByText(/Not Now|Never for This Website|Don.t Save/),
  );
}

/**
 * The documented test code for a `+clerk_test@` address.
 *
 * @see https://clerk.com/docs/testing/test-emails-and-phones
 */
async function submitEmailCode(device: Device): Promise<void> {
  if (!(await isVisible(device.getByText('Check your email')))) {
    return;
  }
  // The code boxes carry no selector of their own.
  await device.keyboard.type('424242');
}

/**
 * clerk-ios puts its identifier on the HStack wrapping the field, and a SwiftUI
 * identifier propagates to every element inside it, so the role is what
 * separates the field from the label and the reveal button sharing that id.
 * clerk-android exposes no identifiers at all, and each of these screens has
 * exactly one EditText.
 */
function identifierField(device: Device, platform: Platform | undefined): Locator {
  return platform === 'ios'
    ? device.locator({ testId: { kind: 'exact', value: 'clerk.auth.start.identifier' }, role: 'text-field' })
    : device.getByRole('text-field');
}

function passwordField(device: Device, platform: Platform | undefined): Locator {
  return platform === 'ios'
    ? device.locator({ testId: { kind: 'exact', value: 'clerk.auth.signIn.password' }, role: 'secure-text-field' })
    : device.getByRole('text-field');
}

/**
 * Tap a button in Clerk's own native UI by the string written on it.
 *
 * Whole-string: the Android sign-in screen alone offers 'Continue to Acme',
 * 'Continue with Apple', 'Continue with GitHub' and 'Continue with Google' next
 * to the button a substring match is looking for.
 */
export async function tapControl(device: Device, name: string): Promise<void> {
  await device.getByText(name, { exact: true }).tap();
}

/** Reads one screen and does not retry, so only use it to branch on. */
async function isVisible(locator: Locator): Promise<boolean> {
  return (await locator.count()) > 0;
}

async function dismissIfPresent(prompt: Locator, dismiss: Locator): Promise<void> {
  if (!(await isVisible(prompt))) {
    return;
  }
  if (await isVisible(dismiss)) {
    await dismiss.tap();
  }
}
