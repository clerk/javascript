import { DisplayThemeJSON, ImageJSON } from './json';
import { ClerkResource } from './resource';
import { PreferredSignInStrategy } from './signIn';

export interface DisplayConfigResource extends ClerkResource {
  id: string;
  instanceEnvironmentType: string;
  applicationName: string;
  theme: DisplayThemeJSON;
  preferredSignInStrategy: PreferredSignInStrategy;
  logoImage: ImageJSON;
  faviconImage: ImageJSON;
  backendHost: string;
  homeUrl: string;
  signInUrl: string;
  signUpUrl: string;
  userProfileUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  afterSignOutUrl: string;
  afterSignOutOneUrl: string;
  afterSignOutAllUrl: string;
  afterSwitchSessionUrl: string;
  branded: boolean;
}
