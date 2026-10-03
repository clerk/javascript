import type { Locator } from 'e2e';

interface Screen {
  getByTestId(id: string): Locator;
  getByText(text: string | RegExp): Locator;
}

export function nativeAuth(screen: Screen, platform: string) {
  const ios = platform === 'ios';
  return {
    identifier: ios ? screen.getByTestId('clerk.auth.start.identifier') : screen.getByText('Enter your email or username'),
    continue: ios ? screen.getByTestId('clerk.auth.start.continue') : screen.getByText('Continue'),
  };
}

export function nativeProfile(screen: Screen) {
  return {
    manageAccount: screen.getByText('Manage account'),
    signOut: screen.getByText('Sign out'),
  };
}

export async function closeStrongPasswordSheet(screen: Screen & { getByText(text: string): Locator }, tap: (target: Locator) => Promise<void>): Promise<void> {
  const sheet = screen.getByText('Use Strong Password?');
  if (await sheet.isVisible().catch(() => false)) await tap(screen.getByTestId('xmark'));
}
