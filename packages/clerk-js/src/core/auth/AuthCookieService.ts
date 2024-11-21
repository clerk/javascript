import { setDevBrowserJWTInURL } from '@clerk/shared/devBrowser';
import { is4xxError, isClerkAPIResponseError, isNetworkError } from '@clerk/shared/error';
import type { EnvironmentResource } from '@clerk/types';

import { clerkCoreErrorTokenRefreshFailed, clerkMissingDevBrowserJwt } from '../errors';
import { eventBus, events } from '../events';
import type { FapiClient } from '../fapiClient';
import type { Clerk } from '../resources/internal';
import { SessionTokenCache } from '../tokenCache';
import type { ClientUatCookieHandler } from './cookies/clientUat';
import { createClientUatCookie } from './cookies/clientUat';
import type { SessionCookieHandler } from './cookies/session';
import { createSessionCookie } from './cookies/session';
import { getCookieSuffix } from './cookieSuffix';
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

    this.refreshTokenOnFocus();
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

  /**
   * Will refresh the session token immediately once
   * if the captcha heartbeat flag is enabled.
   * We want to do this to ensure that we collect at least one token
   * even for short-lived sessions.
   */
  public forceRefreshSessionToken() {
    if (this.clerk.__unstable__environment?.displayConfig.captchaHeartbeat) {
      SessionTokenCache.clear();
      void this.refreshSessionToken();
    }
  }

  private startPollingForToken() {
    if (!this.poller) {
      this.poller = new SessionCookiePoller();
    }
    this.poller.startPollingForSessionToken(() => this.refreshSessionToken());
  }

  private refreshTokenOnFocus() {
    window.addEventListener('focus', () => {
      if (document.visibilityState === 'visible') {
        // Certain data-fetching libraries that refetch on focus (such as swr) use setTimeout(cb, 0) to schedule a task on the event loop.
        // This gives us an opportunity to ensure the session cookie is updated with a fresh token before the fetch occurs, but it needs to
        // be done with a microtask. Promises schedule microtasks, and so by using `updateCookieImmediately: true`, we ensure that the cookie
        // is updated as part of the scheduled microtask. Our existing event-based mechanism to update the cookie schedules a task, and so the cookie
        // is updated too late and not guaranteed to be fresh before the refetch occurs.
        void this.refreshSessionToken({ updateCookieImmediately: true });
      }
    });
  }

  private async refreshSessionToken({
    updateCookieImmediately = false,
  }: {
    updateCookieImmediately?: boolean;
  } = {}): Promise<void> {
    if (!this.clerk.session) {
      return;
    }

    try {
      const token = await this.clerk.session.getToken();
      if (updateCookieImmediately) {
        this.updateSessionCookie(token);
      }
    } catch (e) {
      return this.handleGetTokenError(e);
    }
  }

  private updateSessionCookie(token: string | null) {
    // only update session cookie from the active tab,
    // or if the tab's selected organization matches the session's active organization
    if (!document.hasFocus() && !this.isCurrentOrganizationActive()) {
      return;
    }

    this.setActiveOrganizationInStorage();

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

  /**
   * The below methods are used to determine whether or not an unfocused tab can be responsible
   * for setting the session cookie. A session cookie should only be set by a tab who's selected
   * organization matches the session's active organization. By storing the active organization
   * ID in local storage, we can check the value across tabs. If a tab's organization ID does not
   * match the value in local storage, it is not responsible for updating the session cookie.
   */

  public setActiveOrganizationInStorage() {
    if (this.clerk.organization?.id) {
      localStorage.setItem('clerk_active_org', this.clerk.organization.id);
    } else {
      localStorage.removeItem('clerk_active_org');
    }
  }

  private isCurrentOrganizationActive() {
    const activeOrganizationId = localStorage.getItem('clerk_active_org');

    if (!activeOrganizationId && !this.clerk.organization?.id) {
      return true;
    }

    return this.clerk.organization?.id === activeOrganizationId;
  }
}
