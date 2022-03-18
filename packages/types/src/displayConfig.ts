import { DisplayThemeJSON, ImageJSON } from './json';
import { ClerkResource } from './resource';

export type PreferredSignInStrategy = 'password' | 'otp';

export interface DisplayConfigJSON {
  object: 'display_config';
  id: string;
  instance_environment_type: string;
  application_name: string;
  theme: DisplayThemeJSON;
  preferred_sign_in_strategy: PreferredSignInStrategy;
  logo_image: ImageJSON;
  favicon_image: ImageJSON;
  backend_host: string;
  home_url: string;
  sign_in_url: string;
  sign_up_url: string;
  user_profile_url: string;
  after_sign_in_url: string;
  after_sign_up_url: string;
  after_sign_out_url: string;
  after_sign_out_one_url: string;
  after_sign_out_all_url: string;
  after_switch_session_url: string;
  branded: boolean;
}

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
