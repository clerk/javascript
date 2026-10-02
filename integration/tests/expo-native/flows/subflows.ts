import type { Locator } from 'e2e';
import { expect } from 'e2e';

import type { DeviceFixtures, Fixtures } from './fixtures.ts';

export async function openApp({ app, device, platform, screen }: DeviceFixtures) {
  await app.open();
  if (platform === 'ios') {
    await device.clearKeychain();
  }
  await app.clearState();
  await expect(screen.getByText(/^signed (in|out)$/)).toBeVisible({ timeout: 45_000 });
  await expect(screen.getByText('signed out')).toBeVisible();
}

export async function tapUntilVisible(control: Locator, outcome: Locator) {
  await expect
    .poll(
      async () => {
        if (!(await outcome.isVisible()) && (await control.isVisible())) {
          await control.tap();
        }
        return outcome.isVisible();
      },
      { timeout: 30_000, interval: 1000 },
    )
    .toBe(true);
}

export async function openAuthView({ screen }: DeviceFixtures) {
  await tapUntilVisible(
    screen.getByTestId('open-auth-view-button'),
    screen.getByText(/^Welcome! Sign in to continue\.?$/),
  );
}

export async function assertSignedIn({ screen }: DeviceFixtures) {
  await expect(screen.getByText('signed in')).toBeVisible({ timeout: 30_000 });
  await expect(screen.getByTestId('user-id')).toBeVisible();
}

export async function assertSignedOut({ screen }: DeviceFixtures) {
  await expect(screen.getByText('signed out')).toBeVisible({ timeout: 20_000 });
}

async function tapCenter({ screen }: DeviceFixtures, control: Locator) {
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  if (!box) {
    throw new Error('Control has no bounding box');
  }
  await screen.tapAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
}

export async function tapControl(fixtures: DeviceFixtures, control: Locator) {
  if (fixtures.platform === 'android') {
    await tapCenter(fixtures, control);
  } else {
    await control.tap();
  }
}

export async function tapBack(fixtures: DeviceFixtures) {
  await tapCenter(fixtures, fixtures.screen.getByLabel('Back').last());
}

async function fill(field: Locator, value: string) {
  await field.tap();
  await field.fill(value).catch((error: { code?: string }) => {
    if (error.code !== 'ENGINE_FAILURE') {
      throw error;
    }
    return field.fill(value);
  });
}

async function enterEmailCode({ screen }: DeviceFixtures) {
  const heading = screen.getByText('Check your email');
  if (!(await heading.isVisible())) {
    return;
  }
  await expect
    .poll(
      async () => {
        const code = screen.getByRole('textbox').last();
        await code.clear();
        await code.pressSequentially('424242');
        await expect(heading).toBeHidden({ timeout: 5000 });
        return true;
      },
      { timeout: 30_000 },
    )
    .toBe(true);
}

async function dismissPasswordManager({ screen }: DeviceFixtures) {
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
  const { screen, user } = fixtures;
  await expect(screen.getByText(/^Welcome! Sign in to continue\.?$/)).toBeVisible({ timeout: 25_000 });
  const identifierLabel = screen.getByText(/^Enter your email( or username)?$/);
  await expect(identifierLabel).toBeVisible({ timeout: 25_000 });
  await tapUntilVisible(identifierLabel, screen.getByRole('textbox'));
  const identifier = screen.getByDisplayValue(user.email);
  if (!(await identifier.isVisible())) {
    await fill(screen.getByRole('textbox'), user.email);
  }
  await expect(identifier).toBeVisible();
  await screen.getByText('Continue').tap();
  await expect(screen.getByText(/^(Enter your password|Check your email)$/).first()).toBeVisible({ timeout: 15_000 });
  await enterEmailCode(fixtures);
  if (await screen.getByText('Enter your password').first().isVisible()) {
    await fill(screen.getByRole('textbox').last(), user.password);
    await screen.getByText('Continue').tap();
    await expect(screen.getByText(afterPassword).first()).toBeVisible({ timeout: 15_000 });
  }
  await enterEmailCode(fixtures);
  await dismissPasswordManager(fixtures);
}
