import { is4xxError, isNetworkError } from '@clerk/shared';
import type { Clerk, EnvironmentResource, SessionResource, TokenResource } from '@clerk/types';

import type { CookieHandler } from '../../../utils';
import { createCookieHandler, inBrowser } from '../../../utils';
import { clerkCoreErrorTokenRefreshFailed } from '../../errors';
import { eventBus, events } from '../../events';
import { isClerkAPIResponseError } from '../../resources';
import { SessionCookiePoller } from './SessionCookiePoller';

export class SessionCookieService {
  private cookies: CookieHandler = createCookieHandler();
  private environment: EnvironmentResource | undefined;
  private poller: SessionCookiePoller | null = null;

  constructor(private clerk: Clerk) {
    // set cookie on token update
    eventBus.on(events.TokenUpdate, ({ token }) => {
      this.updateSessionCookie(token?.getRawString());
    });

    this.refreshTokenOnVisibilityChange();
    this.startPollingForToken();
  }

  public setEnvironment(environment: EnvironmentResource) {
    this.environment = environment;
    this.setClientUatCookieForDevelopmentInstances();
  }

  public async setAuthCookiesFromSession(session: SessionResource | undefined | null): Promise<void> {
    this.updateSessionCookie(await session?.getToken());
    this.setClientUatCookieForDevelopmentInstances();
  }

  private startPollingForToken() {
    if (!this.poller) {
      this.poller = new SessionCookiePoller();
    }
    this.poller.startPollingForSessionToken(() => this.refreshSessionToken());
  }

  private refreshTokenOnVisibilityChange() {
    if (!inBrowser()) {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void this.refreshSessionToken();
      }
    });
  }

  private async refreshSessionToken(): Promise<void> {
    if (!inBrowser()) {
      return;
    }

    if (!this.clerk.session) {
      return;
    }

    try {
      this.updateSessionCookie(await this.getNewToken());
    } catch (e) {
      try {
        return this.handleGetTokenError(e);
      } catch {
        return this.clerk.setActive({ session: null });
      }
    }
  }

  private getNewToken() {
    return this.clerk.session?.getToken();
  }

  private setSessionCookie(token: TokenResource | string) {
    this.cookies.setSessionCookie(typeof token === 'string' ? token : token.getRawString());
  }

  private updateSessionCookie(token: TokenResource | string | undefined | null) {
    return token ? this.setSessionCookie(token) : this.removeSessionCookie();
  }

  private removeSessionCookie() {
    this.cookies.removeSessionCookie();
  }

  private setClientUatCookieForDevelopmentInstances() {
    if (this.environment && this.environment.isDevelopmentOrStaging() && this.inCustomDevelopmentDomain()) {
      this.cookies.setClientUatCookie(this.clerk.client);
    }
  }

  private inCustomDevelopmentDomain() {
    const domain = this.clerk.frontendApi.replace('clerk.', '');
    return !window.location.host.endsWith(domain);
  }

  private handleGetTokenError(e: any) {
    if (isClerkAPIResponseError(e)) {
      if (!is4xxError(e) || isNetworkError(e)) {
        return;
      }
      clerkCoreErrorTokenRefreshFailed(e.toString());
    }
    clerkCoreErrorTokenRefreshFailed(e.message || e);
  }
}
