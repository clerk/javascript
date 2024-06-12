import { setDevBrowserJWTInURL } from '@clerk/shared/devBrowser';
import { is4xxError, isClerkAPIResponseError, isNetworkError } from '@clerk/shared/error';
import { getCookieSuffix } from '@clerk/shared/keys';
import type { Clerk, EnvironmentResource } from '@clerk/types';

import { clerkCoreErrorTokenRefreshFailed, clerkMissingDevBrowserJwt } from '../errors';
import { eventBus, events } from '../events';
import type { FapiClient } from '../fapiClient';
import type { ClientUatCookieHandler } from './cookies/clientUat';
import { createClientUatCookie } from './cookies/clientUat';
import type { SessionCookieHandler } from './cookies/session';
import { createSessionCookie } from './cookies/session';
import type { DevBrowser } from './devBrowser';
import { createDevBrowser } from './devBrowser';
import { SessionCookiePoller } from './SessionCookiePoller';

// TODO(@dimkl): make AuthCookieService singleton since it handles updating cookies using a poller
// and we need to avoid updating them concurrently.
/**
 * The AuthCookieService class is a service responsible to handle
 * all operations and helpers required in a standard browser context
 * based on the cookies to remove the dependency between cookies
 * and auth from the Clerk instance.
 * This service is responsible to:
 *   - refresh the session cookie using a poller
 *   - refresh the session cookie on tab visibility change
 *   - update the related cookies listening to the `token:update` event
 *   - initialize auth related cookies for development instances (eg __client_uat, __clerk_db_jwt)
 *   - cookie setup for production / development instances
 * It also provides the following helpers:
 *   - isSignedOut(): check if the current user is signed-out using cookies
 *   - decorateUrlWithDevBrowserToken(): decorates url with auth related info (eg dev browser jwt)
 *   - handleUnauthenticatedDevBrowser(): resets dev browser in case of invalid dev browser
 *   - setEnvironment(): update cookies (eg client_uat) related to environment
 */
export class AuthCookieService {
  private environment: EnvironmentResource | undefined;
  private poller: SessionCookiePoller | null = null;
  private clientUat: ClientUatCookieHandler;
  private sessionCookie: SessionCookieHandler;
  private devBrowser: DevBrowser;

  public static async create(clerk: Clerk, fapiClient: FapiClient) {
    const cookieSuffix = await getCookieSuffix(clerk.publishableKey);
    return new AuthCookieService(clerk, fapiClient, cookieSuffix);
  }

  private constructor(
    private clerk: Clerk,
    fapiClient: FapiClient,
    cookieSuffix: string,
  ) {
    // set cookie on token update
    eventBus.on(events.TokenUpdate, ({ token }) => {
      this.updateSessionCookie(token && token.getRawString());
      this.setClientUatCookieForDevelopmentInstances();
    });

    this.refreshTokenOnVisibilityChange();
    this.startPollingForToken();

    this.clientUat = createClientUatCookie(cookieSuffix);
    this.sessionCookie = createSessionCookie(cookieSuffix);
    this.devBrowser = createDevBrowser({
      frontendApi: clerk.frontendApi,
      fapiClient,
      cookieSuffix,
    });
  }

  // TODO(@dimkl): Replace this method call with an event listener to decouple Clerk with setEnvironment
  public setEnvironment(environment: EnvironmentResource) {
    this.environment = environment;
    this.setClientUatCookieForDevelopmentInstances();
  }

  public isSignedOut() {
    if (!this.clerk.loaded) {
      return this.clientUat.get() <= 0;
    }
    return !!this.clerk.user;
  }

  public async setupDevelopment() {
    await this.devBrowser.setup();
  }

  public setupProduction() {
    this.devBrowser.clear();
  }

  public async handleUnauthenticatedDevBrowser() {
    this.devBrowser.clear();
    await this.devBrowser.setup();
  }

  public decorateUrlWithDevBrowserToken(url: URL): URL {
    const devBrowserJwt = this.devBrowser.getDevBrowserJWT();
    if (!devBrowserJwt) {
      return clerkMissingDevBrowserJwt();
    }

    return setDevBrowserJWTInURL(url, devBrowserJwt);
  }

  private startPollingForToken() {
    if (!this.poller) {
      this.poller = new SessionCookiePoller();
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
      await this.clerk.session.getToken();
    } catch (e) {
      return this.handleGetTokenError(e);
    }
  }

  private updateSessionCookie(token: string | null) {
    return token ? this.sessionCookie.set(token) : this.sessionCookie.remove();
  }

  private setClientUatCookieForDevelopmentInstances() {
    if (this.environment?.isDevelopmentOrStaging() && this.inCustomDevelopmentDomain()) {
      this.clientUat.set(this.clerk.client);
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
