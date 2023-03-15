import { isNetworkError, isUnauthorizedError } from '@clerk/shared';
import type { Clerk, EnvironmentResource, SessionResource, TokenResource } from '@clerk/types';

import type { CookieHandler } from '../../../utils';
import { createCookieHandler, inBrowser } from '../../../utils';
import { clerkCoreErrorTokenRefreshFailed } from '../../errors';
import { isClerkAPIResponseError } from '../../resources';
import { AuthenticationPoller } from './AuthenticationPoller';

type InitParams = {
  environment: EnvironmentResource;
  enablePolling?: boolean;
};

export class AuthenticationService {
  private enablePolling = true;
  private cookies: CookieHandler = createCookieHandler();
  private environment: EnvironmentResource | undefined;
  private poller: AuthenticationPoller | null = null;

  constructor(private clerk: Clerk) {}

  public async initAuth(opts: InitParams): Promise<void> {
    this.enablePolling = opts.enablePolling ?? true;
    this.environment = opts.environment;
    await this.setAuthCookiesFromSession(this.clerk.session);
    this.setClientUatCookieForDevelopmentInstances();
    this.clearLegacyAuthV1Cookies();
    this.startPollingForToken();
    this.refreshTokenOnVisibilityChange();
  }

  public async setAuthCookiesFromSession(session: SessionResource | undefined | null): Promise<void> {
    this.updateSessionCookie(await session?.getToken());
    this.setClientUatCookieForDevelopmentInstances();
  }

  public setAuthCookiesFromToken(token: string | undefined): void {
    this.updateSessionCookie(token);
    this.setClientUatCookieForDevelopmentInstances();
  }

  private startPollingForToken() {
    if (!this.enablePolling) {
      return;
    }
    if (!this.poller) {
      this.poller = new AuthenticationPoller();
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
      return this.handleGetTokenError(e);
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

  private clearLegacyAuthV1Cookies() {
    if (this.environment?.isProduction() && this.environment?.onWindowLocationHost()) {
      void this.cookies.clearLegacyAuthV1SessionCookie();
    }
  }

  private handleGetTokenError(e: any) {
    if (isClerkAPIResponseError(e)) {
      if (isUnauthorizedError(e) || isNetworkError(e)) {
        return;
      }
      clerkCoreErrorTokenRefreshFailed(e.toString());
    }
    clerkCoreErrorTokenRefreshFailed(e.message || e);
  }
}
