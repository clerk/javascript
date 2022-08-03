import { DisplayThemeJSON, ImageJSON } from './json';
import { ClerkResource } from './resource';

export type PreferredSignInStrategy = 'password' | 'otp';

export interface DisplayConfigJSON {
  object: 'display_config';
  id: string;
  after_sign_in_url: string;
  after_sign_out_all_url: string;
  after_sign_out_one_url: string;
  after_sign_out_url: string;
  after_sign_up_url: string;
  after_switch_session_url: string;
  application_name: string;
  backend_host: string;
  branded: boolean;
  favicon_image: ImageJSON;
  home_url: string;
  instance_environment_type: string;
  logo_image: ImageJSON;
  preferred_sign_in_strategy: PreferredSignInStrategy;
  sign_in_url: string;
  sign_up_url: string;
  support_email: string;
  theme: DisplayThemeJSON;
  user_profile_url: string;
}

export interface DisplayConfigResource extends ClerkResource {
  id: string;
  afterSignInUrl: string;
  afterSignOutAllUrl: string;
  afterSignOutOneUrl: string;
  afterSignOutUrl: string;
  afterSignUpUrl: string;
  afterSwitchSessionUrl: string;
  applicationName: string;
  backendHost: string;
  branded: boolean;
  faviconImage: ImageJSON;
  homeUrl: string;
  instanceEnvironmentType: string;
  logoImage: ImageJSON;
  preferredSignInStrategy: PreferredSignInStrategy;
  signInUrl: string;
  signUpUrl: string;
  supportEmail: string;
  theme: DisplayThemeJSON;
  userProfileUrl: string;
}
