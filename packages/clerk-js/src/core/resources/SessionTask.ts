import type {
  ClerkOptions,
  EnvironmentResource,
  SessionTaskJSON,
  SessionTaskKey,
  SessionTaskResource,
} from '@clerk/types';

import { buildURL } from '../../utils';

export const SESSION_TASK_PATHS = ['add-organization'] as const;
type SessionTaskPath = (typeof SESSION_TASK_PATHS)[number];

/**
 * Maps URL paths for each session task key in order to not rely on FAPI nomenclature
 */
export const SESSION_TASK_PATH_BY_KEY: Record<SessionTaskKey, SessionTaskPath> = {
  org: 'add-organization',
} as const;

export class SessionTask implements SessionTaskResource {
  key!: SessionTaskKey;

  constructor(data: SessionTaskJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: SessionTaskJSON): this {
    if (!data) {
      return this;
    }

    this.key = data.key;

    return this;
  }

  /**
   * Resolves path for internal component routing
   */
  public __internal_getPath(): SessionTaskPath {
    return SESSION_TASK_PATH_BY_KEY[this.key];
  }

  /**
   * Resolves a absolute URL for custom flows
   */
  public __internal_getUrl(options: ClerkOptions, environment: EnvironmentResource): string {
    const signInUrl = options['signInUrl'] || environment.displayConfig.signInUrl;
    const signUpUrl = options['signUpUrl'] || environment.displayConfig.signUpUrl;
    const isReferrerSignUpUrl = window.location.href.startsWith(signUpUrl);

    return buildURL(
      // TODO - Accept custom URL option for custom flows in order to eject out of `signInUrl/signUpUrl`
      { base: isReferrerSignUpUrl ? signUpUrl : signInUrl, hashPath: `/${this.__internal_getPath()}` },
      { stringify: true },
    );
  }
}
