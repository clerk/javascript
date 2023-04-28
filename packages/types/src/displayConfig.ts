import type { DisplayThemeJSON } from './json';
import type { ClerkResource } from './resource';

export type PreferredSignInStrategy = 'password' | 'otp';

export interface DisplayConfigJSON {
  object: 'display_config';
  id: string;
  after_sign_in_url: string;
  after_sign_out_all_url: string;
  after_sign_out_one_url: string;
  after_sign_up_url: string;
  after_switch_session_url: string;
  application_name: string;
  branded: boolean;
  home_url: string;
  instance_environment_type: string;
  logo_url: string;
  favicon_url: string;
  preferred_sign_in_strategy: PreferredSignInStrategy;
  sign_in_url: string;
  sign_up_url: string;
  support_email: string;
  theme: DisplayThemeJSON;
  user_profile_url: string;
  clerk_js_version?: string;
  experimental_force_oauth_first?: boolean;
  organization_profile_url: string;
  create_organization_url: string;
  after_leave_organization_url: string;
  after_create_organization_url: string;
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
  homeUrl: string;
  instanceEnvironmentType: string;
  logoUrl: string;
  faviconUrl: string;
  preferredSignInStrategy: PreferredSignInStrategy;
  signInUrl: string;
  signUpUrl: string;
  supportEmail: string;
  theme: DisplayThemeJSON;
  userProfileUrl: string;
  clerkJSVersion?: string;
  experimental__forceOauthFirst?: boolean;
  organizationProfileUrl: string;
  createOrganizationUrl: string;
  afterLeaveOrganizationUrl: string;
  afterCreateOrganizationUrl: string;
}
