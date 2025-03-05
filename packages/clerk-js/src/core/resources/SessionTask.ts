import type {
  ClerkOptions,
  EnvironmentResource,
  SessionTaskJSON,
  SessionTaskJSONSnapshot,
  SessionTaskKey,
  SessionTaskResource,
} from '@clerk/types';

import { buildURL, inBrowser } from '../../utils';

export const SESSION_TASK_PATHS = ['add-organization'] as const;
type SessionTaskPath = (typeof SESSION_TASK_PATHS)[number];

export const SESSION_TASK_PATH_BY_KEY: Record<SessionTaskKey, SessionTaskPath> = {
  org: 'add-organization',
} as const;

export class SessionTask implements SessionTaskResource {
  key!: SessionTaskKey;

  constructor(data: SessionTaskJSON | SessionTaskJSONSnapshot) {
    this.fromJSON(data);
  }

  protected fromJSON(data: SessionTaskJSON | SessionTaskJSONSnapshot): this {
    if (!data) {
      return this;
    }

    this.key = data.key;

    return this;
  }

  public __internal_toSnapshot(): SessionTaskJSONSnapshot {
    return {
      key: this.key,
    };
  }

  public __internal_getUrlPath(): `/${SessionTaskPath}` {
    return `/${SESSION_TASK_PATH_BY_KEY[this.key]}`;
  }

  public __internal_getAbsoluteUrl(options: ClerkOptions, environment?: EnvironmentResource | null): string {
    if (!environment || !inBrowser()) {
      return '';
    }

    const signInUrl = options['signInUrl'] || environment.displayConfig.signInUrl;
    const signUpUrl = options['signUpUrl'] || environment.displayConfig.signUpUrl;
    const isReferrerSignUpUrl = window.location.href.startsWith(signUpUrl);

    return buildURL(
      // TODO - Introduce custom `tasksUrl` option to be used as a base path fallback for custom flows
      { base: isReferrerSignUpUrl ? signUpUrl : signInUrl, hashPath: this.__internal_getUrlPath() },
      { stringify: true },
    );
  }
}
