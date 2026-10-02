import { test } from '@e2e-dev/mobile';
import { expect } from 'e2e';

import { openApp } from './subflows.ts';

test('useSignInWithGoogle surfaces the missing-credentials error', async fixtures => {
  const { screen } = fixtures;
  await openApp(fixtures);
  await screen.getByTestId('google-sign-in-button').tap();
  await expect(screen.getByText(/Google Sign-In credentials not found/)).toBeVisible({ timeout: 15_000 });
});
