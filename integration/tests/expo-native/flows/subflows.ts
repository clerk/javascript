import type { Device } from '@e2e-dev/mobile';
import type { Locator, TestFixtures } from 'e2e';
import { expect } from 'e2e';

export type Fixtures = TestFixtures & { device: Device };

const email = process.env.CLERK_TEST_EMAIL ?? '';
const password = process.env.CLERK_TEST_PASSWORD ?? '';

export async function openApp({ app, device, platform, screen }: Fixtures) {
  await app.open();
  if (platform === 'ios') {
    await device.clearKeychain();
  }
  await app.clearState();
  await expect(screen.getByText(/^signed (in|out)$/)).toBeVisible({ timeout: 45_000 });
  await expect(screen.getByText('signed out')).toBeVisible();
}

export async function assertSignedIn({ screen }: Fixtures) {
  await expect(screen.getByText('signed in')).toBeVisible({ timeout: 30_000 });
  await expect(screen.getByTestId('user-id')).toBeVisible();
}

export async function assertSignedOut({ screen }: Fixtures) {
  await expect(screen.getByText('signed out')).toBeVisible({ timeout: 20_000 });
}

export async function tapBack({ screen }: Fixtures) {
  const back = screen.getByLabel('Back');
  await expect(back).toBeVisible();
  const box = await back.boundingBox();
  if (!box) {
    throw new Error('Back control has no bounding box');
  }
  await screen.tapAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
}

async function fill(field: Locator, value: string) {
  await field.fill(value).catch((error: { code?: string }) => {
    if (error.code !== 'ENGINE_FAILURE') {
      throw error;
    }
    return field.fill(value);
  });
}

async function skipPasskeyFirstFactor({ platform, screen }: Fixtures) {
  if (platform === 'ios') {
    const error = screen.getByText('Whoops, something is wrong');
    await expect(error).toBeVisible({ timeout: 10_000 });
    for (let attempt = 0; attempt < 3 && (await error.isVisible()); attempt++) {
      await screen.getByRole('button', 'Close').last().tap();
      await expect(error)
        .toBeHidden({ timeout: 3000 })
        .catch(() => {});
    }
  }
  await screen.getByText(/^Use (a different|another) method$/).tap();
  await screen.getByText('Sign in with your password').tap();
}

async function enterEmailCode({ screen }: Fixtures) {
  if (await screen.getByText('Check your email').isVisible()) {
    await fill(screen.getByRole('textbox'), '424242');
  }
}

async function dismissPasswordManager({ screen }: Fixtures) {
  if (
    await screen
      .getByText(/Google Password Manager/)
      .first()
      .isVisible()
  ) {
    await screen
      .getByText(/^(Not now|Never)$/i)
      .first()
      .tap();
  }
  if (
    await screen
      .getByText(/^(Save Password|Strong Password|Use Strong Password|AutoFill Passwords)$/i)
      .first()
      .isVisible()
  ) {
    const dismiss = screen.getByText(/^(Not Now|Never for This Website|Don.t Save)$/i).first();
    if (await dismiss.isVisible()) {
      await dismiss.tap();
    }
  }
}

const afterPassword =
  /^(Check your email|signed in|Save Password|Strong Password|Use Strong Password|AutoFill Passwords)$|Google Password Manager/i;

export async function signInEmailPassword(fixtures: Fixtures) {
  const { screen } = fixtures;
  await expect(screen.getByText(/^Welcome! Sign in to continue\.?$/)).toBeVisible({ timeout: 25_000 });
  const identifierPlaceholder = screen.getByText(/^Enter your email( or username)?$/);
  if (await identifierPlaceholder.isVisible()) {
    await identifierPlaceholder.tap();
  }
  const identifier = screen.getByDisplayValue(email);
  if (!(await identifier.isVisible())) {
    await fill(screen.getByRole('textbox'), email);
  }
  await expect(identifier).toBeVisible();
  await screen.getByText('Continue').tap();
  const firstFactor = screen.getByText(/^(Enter your password|Check your email|Use your passkey)$/).first();
  await expect(firstFactor).toBeVisible({ timeout: 15_000 });
  if (await screen.getByText('Use your passkey').isVisible()) {
    await skipPasskeyFirstFactor(fixtures);
    await expect(screen.getByText('Enter your password').first()).toBeVisible({ timeout: 15_000 });
  }
  await enterEmailCode(fixtures);
  if (await screen.getByText('Enter your password').first().isVisible()) {
    await fill(screen.getByRole('textbox'), password);
    await screen.getByText('Continue').tap();
    await expect(screen.getByText(afterPassword).first()).toBeVisible({ timeout: 15_000 });
  }
  await enterEmailCode(fixtures);
  await dismissPasswordManager(fixtures);
}
