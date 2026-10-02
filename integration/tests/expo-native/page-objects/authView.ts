import { expect } from 'e2e';

import type { DeviceFixtures } from '../types.ts';
import type { TestUser } from '../users.ts';
import { fill, focus, tapUntilVisible } from './gestures.ts';

const welcome = /^Welcome! Sign in to continue\.?$/;
const iosPasswordPrompt = /^(Save Password|Strong Password|Use Strong Password|AutoFill Passwords)$/i;
const androidPasswordPrompt = /Google Password Manager/;
const afterPassword = new RegExp(`^signed in$|${iosPasswordPrompt.source}|${androidPasswordPrompt.source}`, 'i');

export const createAuthViewPageObject = ({ device, platform, screen }: DeviceFixtures) => {
  const openButton = screen.getByTestId('open-auth-view-button');

  const dismissAndroidPasswordPrompt = async () => {
    if (await screen.getByText(androidPasswordPrompt).first().isVisible()) {
      await screen
        .getByText(/^(Not now|Never)$/i)
        .first()
        .tap();
    }
  };

  const dismissIosPasswordPrompt = async () => {
    const dismiss = screen.getByText(/^(Not Now|Never for This Website|Don.t Save)$/i).first();
    if ((await screen.getByText(iosPasswordPrompt).first().isVisible()) && (await dismiss.isVisible())) {
      await dismiss.tap();
    }
  };

  const self = {
    open: () => {
      return tapUntilVisible(openButton, screen.getByText(welcome));
    },
    dismiss: async () => {
      if (platform === 'android') {
        await device.back();
        await expect(openButton).toBeVisible({ timeout: 15_000 });
      } else {
        await tapUntilVisible(screen.getByRole('button', 'Close'), openButton);
      }
    },
    setIdentifier: async (identifier: string) => {
      const label = screen.getByText(/^Enter your email( or username)?$/);
      await expect(label).toBeVisible({ timeout: 25_000 });
      await tapUntilVisible(label, screen.getByRole('textbox'));
      const value = screen.getByDisplayValue(identifier);
      if (!(await value.isVisible())) {
        await fill(screen.getByRole('textbox'), identifier);
      }
      await expect(value).toBeVisible();
    },
    setPassword: async (password: string) => {
      const field = screen.getByRole('textbox').last();
      await focus(field);
      await field.pressSequentially(password);
    },
    continue: () => {
      return screen.getByText('Continue').tap();
    },
    dismissPasswordPrompt: async () => {
      await dismissAndroidPasswordPrompt();
      await dismissIosPasswordPrompt();
    },
    signIn: async ({ email, password }: TestUser) => {
      await expect(screen.getByText(welcome)).toBeVisible({ timeout: 25_000 });
      await self.setIdentifier(email);
      await self.continue();
      await expect(screen.getByText('Enter your password').first()).toBeVisible({ timeout: 15_000 });
      await self.setPassword(password);
      await self.continue();
      await expect(screen.getByText(afterPassword).first()).toBeVisible({ timeout: 45_000 });
      await self.dismissPasswordPrompt();
    },
  };
  return self;
};
