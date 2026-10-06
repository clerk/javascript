import type { Locator } from 'e2e';

interface Screen {
  getByTestId(id: string): Locator;
  getByText(text: string | RegExp): Locator;
  getByLabel(text: string): Locator;
}

export function nativeAuth(screen: Screen, platform: string) {
  const ios = platform === 'ios';
  return {
    identifier: ios
      ? screen.getByTestId('clerk.auth.start.identifier')
      : screen.getByText('Enter your email or username'),
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
