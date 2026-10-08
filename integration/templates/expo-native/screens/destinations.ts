export type Destination =
  | 'auth'
  | 'nativeAuth'
  | 'customSignIn'
  | 'customSignUp'
  | 'nativeModules'
  | 'embeddedProfile'
  | 'tokenCache';

type HomeLink = {
  opens: Destination;
  label: string;
  testID: string;
  shownWhen: 'signedOut' | 'signedIn' | 'always';
};

const homeLinks: readonly HomeLink[] = [
  { opens: 'auth', label: 'Sign in full screen', testID: 'e2e.auth.signInFullScreen', shownWhen: 'signedOut' },
  {
    opens: 'nativeAuth',
    label: 'Sign in full screen with a close button',
    testID: 'e2e.home.nativeAuth',
    shownWhen: 'signedOut',
  },
  { opens: 'customSignIn', label: 'Custom sign-in', testID: 'e2e.home.customSignIn', shownWhen: 'signedOut' },
  { opens: 'customSignUp', label: 'Custom sign-up', testID: 'e2e.home.customSignUp', shownWhen: 'signedOut' },
  { opens: 'nativeModules', label: 'Native modules', testID: 'e2e.home.nativeModules', shownWhen: 'signedOut' },
  { opens: 'embeddedProfile', label: 'Embedded profile', testID: 'e2e.home.embeddedProfile', shownWhen: 'signedIn' },
  { opens: 'tokenCache', label: 'Token cache status', testID: 'e2e.home.tokenCache', shownWhen: 'always' },
];

export function homeLinksFor(isSignedIn: boolean): readonly HomeLink[] {
  const state = isSignedIn ? 'signedIn' : 'signedOut';
  return homeLinks.filter(link => link.shownWhen === 'always' || link.shownWhen === state);
}
