import { Clerk, EnvironmentResource, SessionResource, TokenResource } from '@clerk/types';

import { CookieHandler, createCookieHandler, runWithExponentialBackOff } from '../../../utils';
import { clerkCoreErrorTokenRefreshFailed } from '../../errors';
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

  public initAuth = (opts: InitParams): void => {
    this.enablePolling = opts.enablePolling ?? true;
    this.setAuthCookiesFromSession(this.clerk.session);
    this.setClientUatCookieForDevelopmentInstances();
    this.clearLegacyAuthV1Cookies();
    this.startPollingForToken();
    this.refreshTokenOnVisibilityChange();
  };

  public setAuthCookiesFromSession(session: SessionResource | undefined | null): void {
    this.updateSessionCookie(session?.lastActiveToken);
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
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void this.refreshSessionToken();
      }
    });
  }

  private async refreshSessionToken(): Promise<void> {
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
    return runWithExponentialBackOff(() => this.clerk.session?.getToken(), {
      shouldRetry: e => !this.isUnauthorizedError(e),
      maxRetries: 8,
    });
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
    if (!this.environment?.isProduction() && this.inCustomDevelopmentDomain()) {
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
    if (this.isUnauthorizedError(e) || this.isNetworkError(e)) {
      return;
    }
    clerkCoreErrorTokenRefreshFailed(e.message || e);
  }

  private isUnauthorizedError(e: any) {
    const status = e?.status;
    const code = e?.errors?.[0]?.code;
    return code === 'authentication_invalid' && status === 401;
  }

  private isNetworkError(e: any) {
    // TODO: revise during error handling epic
    const message = ((e.message + e.name || '') as string).toLowerCase().replace(/\s+/g, '');
    return message.includes('networkerror');
  }
}
