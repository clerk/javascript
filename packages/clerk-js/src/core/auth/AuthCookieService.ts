import { isValidBrowserOnline } from '@clerk/shared/browser';
import type { createClerkEventBus } from '@clerk/shared/clerkEventBus';
import { clerkEvents } from '@clerk/shared/clerkEventBus';
import type { createCookieHandler } from '@clerk/shared/cookie';
import { setDevBrowserJWTInURL } from '@clerk/shared/devBrowser';
import { is4xxError, isClerkAPIResponseError, isClerkRuntimeError, isNetworkError } from '@clerk/shared/error';
import type { Clerk, InstanceType } from '@clerk/shared/types';
import { noop } from '@clerk/shared/utils';

import { debugLogger } from '@/utils/debug';

import { clerkMissingDevBrowserJwt } from '../errors';
import { eventBus, events } from '../events';
import type { FapiClient } from '../fapiClient';
import { createActiveContextCookie } from './cookies/activeContext';
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
 */
export class AuthCookieService {
  private poller: SessionCookiePoller | null = null;
  private clientUat: ClientUatCookieHandler;
  private sessionCookie: SessionCookieHandler;
  private activeCookie: ReturnType<typeof createCookieHandler>;
  private devBrowser: DevBrowser;

  public static async create(
    clerk: Clerk,
    fapiClient: FapiClient,
    instanceType: InstanceType,
    clerkEventBus: ReturnType<typeof createClerkEventBus>,
  ) {
    const cookieSuffix = await getCookieSuffix(clerk.publishableKey);
    const service = new AuthCookieService(clerk, fapiClient, cookieSuffix, instanceType, clerkEventBus);
    await service.setup();
    return service;
  }

  private constructor(
    private clerk: Clerk,
    fapiClient: FapiClient,
    cookieSuffix: string,
    private instanceType: InstanceType,
    private clerkEventBus: ReturnType<typeof createClerkEventBus>,
  ) {
    // set cookie on token update
    eventBus.on(events.TokenUpdate, ({ token }) => {
      this.updateSessionCookie(token && token.getRawString());
      this.setClientUatCookieForDevelopmentInstances();
    });

    eventBus.on(events.UserSignOut, () => this.handleSignOut());

    this.refreshTokenOnFocus();
    this.startPollingForToken();

    this.clientUat = createClientUatCookie(cookieSuffix);
    this.sessionCookie = createSessionCookie(cookieSuffix);
    this.activeCookie = createActiveContextCookie();
    this.devBrowser = createDevBrowser({
      frontendApi: clerk.frontendApi,
      fapiClient,
      cookieSuffix,
    });
  }

  public async setup() {
    if (this.instanceType === 'production') {
      return this.setupProduction();
    } else {
      return this.setupDevelopment();
    }
  }

  public isSignedOut() {
    if (!this.clerk.loaded) {
      return this.clientUat.get() <= 0;
    }
    return !!this.clerk.user;
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

  private async setupDevelopment() {
    await this.devBrowser.setup();
  }

  private setupProduction() {
    this.devBrowser.clear();
  }

  public startPollingForToken() {
    if (!this.poller) {
      this.poller = new SessionCookiePoller();
      this.poller.startPollingForSessionToken(() => this.refreshSessionToken());
    }
  }

  public stopPollingForToken() {
    if (this.poller) {
      this.poller.stopPollingForSessionToken();
      this.poller = null;
    }
  }

  private refreshTokenOnFocus() {
    window.addEventListener('focus', () => {
      if (document.visibilityState === 'visible') {
        // Certain data-fetching libraries that refetch on focus (such as swr) use setTimeout(cb, 0) to schedule a task on the event loop.
        // This gives us an opportunity to ensure the session cookie is updated with a fresh token before the fetch occurs, but it needs to
        // be done with a microtask. Promises schedule microtasks, and so by using `updateCookieImmediately: true`, we ensure that the cookie
        // is updated as part of the scheduled microtask. Our existing event-based mechanism to update the cookie schedules a task, and so the cookie
        // is updated too late and not guaranteed to be fresh before the refetch occurs.
        // While online `.schedule()` executes synchronously and immediately, ensuring the above mechanism will not break.
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
    // Only allow background tabs to update if both session and organization match
    if (!document.hasFocus() && !this.isCurrentContextActive()) {
      return;
    }

    if (!token && !isValidBrowserOnline()) {
      debugLogger.warn('Removing session cookie (offline)', { sessionId: this.clerk.session?.id }, 'authCookieService');
    }

    this.setActiveContextInStorage();

    return token ? this.sessionCookie.set(token) : this.sessionCookie.remove();
  }

  public setClientUatCookieForDevelopmentInstances() {
    if (this.instanceType !== 'production' && this.inCustomDevelopmentDomain()) {
      this.clientUat.set(this.clerk.client);
    }
  }

  private inCustomDevelopmentDomain() {
    const domain = this.clerk.frontendApi.replace('clerk.', '');
    return !window.location.host.endsWith(domain);
  }

  private handleGetTokenError(e: any) {
    //early return if not a clerk api error (aka fapi error) and not a network error
    if (!isClerkAPIResponseError(e) && !isClerkRuntimeError(e) && !isNetworkError(e)) {
      return;
    }

    //sign user out if a 4XX error
    if (is4xxError(e)) {
      void this.clerk.handleUnauthenticated().catch(noop);
      return;
    }

    // The poller failed to fetch a fresh session token, update status to `degraded`.
    this.clerkEventBus.emit(clerkEvents.Status, 'degraded');

    // --------
    // Treat any other error as a noop
    // TODO(debug-logs): Once debug logs is available log this error.
    // --------
  }

  private handleSignOut() {
    this.activeCookie.remove();
    this.sessionCookie.remove();
    this.setClientUatCookieForDevelopmentInstances();
  }

  /**
   * The below methods handle active context tracking (session and organization) to ensure
   * only tabs with matching context can update the session cookie.
   * The format of the cookie value is "<session id>:<org id>" where either part can be empty.
   */

  public setActiveContextInStorage() {
    const sessionId = this.clerk.session?.id || '';
    const orgId = this.clerk.organization?.id || '';
    const contextValue = `${sessionId}:${orgId}`;

    if (contextValue !== ':') {
      this.activeCookie.set(contextValue);
    } else {
      this.activeCookie.remove();
    }
  }

  private isCurrentContextActive() {
    const activeContext = this.activeCookie.get();
    if (!activeContext) {
      // we should always have an active context, so return true if there isn't one and treat the current context as active
      return true;
    }

    const [activeSessionId, activeOrgId] = activeContext.split(':');
    const currentSessionId = this.clerk.session?.id || '';
    const currentOrgId = this.clerk.organization?.id || '';

    return activeSessionId === currentSessionId && activeOrgId === currentOrgId;
  }

  public getSessionCookie() {
    return this.sessionCookie.get();
  }
}
