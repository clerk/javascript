import { is4xxError, isClerkAPIResponseError, isNetworkError } from '@clerk/shared/error';
import type { Clerk, EnvironmentResource, SessionResource, TokenResource } from '@clerk/types';

import { inBrowser } from '../../utils';
import { clerkCoreErrorTokenRefreshFailed } from '../errors';
import { eventBus, events } from '../events';
import { setClientUatCookie } from './clientUat';
import { removeSessionCookie, setSessionCookie } from './session';
import { SessionCookiePoller } from './SessionCookiePoller';

export class SessionCookieService {
  private environment: EnvironmentResource | undefined;
  private poller: SessionCookiePoller | null = null;
  private publishableKey: string;

  constructor(private clerk: Clerk) {
    // set cookie on token update
    eventBus.on(events.TokenUpdate, ({ token }) => {
      this.updateSessionCookie(token?.getRawString());
    });

    this.refreshTokenOnVisibilityChange();
    this.startPollingForToken();
    this.publishableKey = clerk.publishableKey;
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
      this.updateSessionCookie(await this.clerk.session?.getToken());
    } catch (e) {
      return this.handleGetTokenError(e);
    }
  }

  private updateSessionCookie(token: TokenResource | string | undefined | null) {
    const rawToken = typeof token === 'string' ? token : token?.getRawString();

    if (rawToken) {
      return setSessionCookie(rawToken);
    }
    return removeSessionCookie();
  }

  private setClientUatCookieForDevelopmentInstances() {
    if (this.environment && this.environment.isDevelopmentOrStaging() && this.inCustomDevelopmentDomain()) {
      setClientUatCookie(this.clerk.client);
    }
  }

  private inCustomDevelopmentDomain() {
    const domain = this.clerk.frontendApi.replace('clerk.', '');
    return !window.location.host.endsWith(domain);
  }

  private handleGetTokenError(e: any) {
    //throw if not a clerk error
    if (!isClerkAPIResponseError(e)) {
      clerkCoreErrorTokenRefreshFailed(e.message || e);
    }

    //sign user out if a 4XX error
    if (is4xxError(e)) {
      void this.clerk.handleUnauthenticated();
      return;
    }

    if (isNetworkError(e)) {
      return;
    }

    clerkCoreErrorTokenRefreshFailed(e.toString());
  }
}
