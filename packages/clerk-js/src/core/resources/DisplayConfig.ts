import type {
  DisplayConfigJSON,
  DisplayConfigResource,
  DisplayThemeJSON,
  ImageJSON,
  PreferredSignInStrategy,
} from '@clerk/types';

import { BaseResource } from './internal';

export class DisplayConfig extends BaseResource implements DisplayConfigResource {
  id!: string;
  instanceEnvironmentType!: string;
  applicationName!: string;
  theme!: DisplayThemeJSON;
  preferredSignInStrategy!: PreferredSignInStrategy;
  logoImage!: ImageJSON;
  faviconImage!: ImageJSON;
  backendHost!: string;
  homeUrl!: string;
  signInUrl!: string;
  signUpUrl!: string;
  userProfileUrl!: string;
  afterSignInUrl!: string;
  afterSignUpUrl!: string;
  afterSignOutUrl!: string;
  afterSignOutOneUrl!: string;
  afterSignOutAllUrl!: string;
  afterSwitchSessionUrl!: string;
  branded!: boolean;

  public constructor(data: DisplayConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: DisplayConfigJSON): this {
    this.id = data.id;
    this.instanceEnvironmentType = data.instance_environment_type;
    this.applicationName = data.application_name;
    this.theme = data.theme;
    this.preferredSignInStrategy = data.preferred_sign_in_strategy;
    this.logoImage = data.logo_image;
    this.faviconImage = data.favicon_image;
    this.backendHost = data.backend_host;
    this.homeUrl = data.home_url;
    this.signInUrl = data.sign_in_url;
    this.signUpUrl = data.sign_up_url;
    this.userProfileUrl = data.user_profile_url;
    this.afterSignInUrl = data.after_sign_in_url;
    this.afterSignUpUrl = data.after_sign_up_url;
    this.afterSignOutUrl = data.after_sign_out_url;
    this.afterSignOutOneUrl = data.after_sign_out_one_url;
    this.afterSignOutAllUrl = data.after_sign_out_all_url;
    this.afterSwitchSessionUrl = data.after_switch_session_url;
    this.branded = data.branded;
    return this;
  }
}
