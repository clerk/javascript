import { expect } from 'e2e';

import { test } from '../fixtures.ts';

test('useSignInWithGoogle surfaces the missing-credentials error', async ({ po, screen }) => {
  await po.app.reset();
  await screen.getByTestId('google-sign-in-button').tap();
  await expect(screen.getByText(/Google Sign-In credentials not found/)).toBeVisible({ timeout: 15_000 });
});
