import { expect, test, request as playwrightRequest } from '@playwright/test';
import { createHash, randomBytes } from 'node:crypto';

const env = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

test('ChatGPT SIWC completes the hosted sign-in, provider, consent, callback, and token journey', async ({ page }) => {
  const host = env('CHATGPT_SIWC_HOST');
  const fapiHost = env('CHATGPT_SIWC_FAPI_HOST');
  const accountsHost = env('CHATGPT_SIWC_ACCOUNTS_HOST');
  const issuerOrigin = env('CHATGPT_SIWC_ISSUER_ORIGIN');
  const bridgeOrigin = env('CHATGPT_SIWC_BRIDGE_ORIGIN');
  const fapiOrigin = env('CHATGPT_SIWC_FAPI_ORIGIN');
  const uiOrigin = env('CHATGPT_SIWC_UI_ORIGIN');
  const publishableKey = env('CHATGPT_SIWC_PUBLISHABLE_KEY');
  const clientId = env('CHATGPT_SIWC_CLIENT_ID');
  const callbackUri = env('CHATGPT_SIWC_CALLBACK_URI');
  const state = env('CHATGPT_SIWC_STATE');
  const challenge = env('CHATGPT_SIWC_CHALLENGE');
  const verifier = env('CHATGPT_SIWC_VERIFIER');
  const resource = env('CHATGPT_SIWC_RESOURCE');
  const scenario = env('CHATGPT_SIWC_SCENARIO');
  const enterpriseOAuthOrigin = process.env.CHATGPT_SIWC_ENTERPRISE_OAUTH_ORIGIN || '';
  const expectedEmail = env('CHATGPT_SIWC_EXPECTED_EMAIL');
  const callbackHost = new URL(callbackUri).hostname;
  let issuerAuthorizationRequests = 0;
  let enterpriseSSOAuthRequests = 0;
  let enterpriseFirstFactorStrategies: string[] = [];
  let innerCallbackResponses = 0;
  let consentSubmissions = 0;
  let innerState = '';
  let innerNonce = '';
  let innerChallenge = '';
  let accountChoiceAuthorizationParams: URLSearchParams | undefined;
  let signUpRequests = 0;
  const consentSessionIDs: string[] = [];

  const safeURL = (raw: string): string => {
    const parsed = new URL(raw);
    const sensitive =
      /^(code|state|nonce|token|access_token|id_token|login_hint|email_address|code_challenge|code_verifier|signIn|signUp)$/i;
    for (const [key, value] of parsed.searchParams.entries()) {
      if (sensitive.test(key)) parsed.searchParams.set(key, '<redacted>');
      else if (key === 'redirect_url') {
        try {
          parsed.searchParams.set(key, safeURL(value));
        } catch {
          parsed.searchParams.set(key, '<redacted>');
        }
      }
    }
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  };
  const expectPath = (pattern: RegExp) => expect.poll(() => new URL(page.url()).pathname).toMatch(pattern);
  const expectQueryParam = (key: string, value: string) =>
    expect.poll(() => new URL(page.url()).searchParams.get(key)).toBe(value);

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) console.log(`[siwc-trace] navigation ${safeURL(frame.url())}`);
  });
  page.context().on('request', request => {
    const requestURL = new URL(request.url());
    if (
      scenario === 'enterprise-sso' &&
      ((requestURL.origin === bridgeOrigin && requestURL.pathname.startsWith('/_enterprise_oauth/oauth2/authorize')) ||
        (enterpriseOAuthOrigin !== '' &&
          requestURL.origin === enterpriseOAuthOrigin &&
          requestURL.pathname === '/oauth2/authorize'))
    ) {
      enterpriseSSOAuthRequests += 1;
    }
    if (
      request.url().includes('/_issuer/authorize') ||
      (requestURL.origin === issuerOrigin && requestURL.pathname === '/authorize')
    ) {
      issuerAuthorizationRequests += 1;
      const providerAuthorization = new URL(request.url());
      innerState = providerAuthorization.searchParams.get('state') ?? '';
      innerNonce = providerAuthorization.searchParams.get('nonce') ?? '';
      innerChallenge = providerAuthorization.searchParams.get('code_challenge') ?? '';
    }
    if (request.method() === 'POST' && request.url().includes('/me/oauth/consent/')) {
      consentSubmissions += 1;
      const sessionID = new URL(request.url()).searchParams.get('_clerk_session_id');
      if (sessionID) consentSessionIDs.push(sessionID);
      if (scenario === 'account-mismatch' && accountChoiceAuthorizationParams) {
        const consentParams = new URLSearchParams(request.postData() || '');
        const boundKeys = [
          'client_id',
          'prompt',
          'state',
          'code_challenge',
          'code_challenge_method',
          'response_type',
          'redirect_uri',
          'scope',
          'nonce',
          'resource',
          'target_flow',
          'login_hint',
          'organization_id',
        ];
        const mismatchedKeys = boundKeys.filter(
          key => (consentParams.get(key) || '') !== (accountChoiceAuthorizationParams!.get(key) || ''),
        );
        if (mismatchedKeys.length) {
          console.log(`[siwc-trace] account-choice binding mismatch keys=${mismatchedKeys.join(',')}`);
        }
        expect(mismatchedKeys).toEqual([]);
      }
    }
    if (request.method() === 'POST' && request.url().includes('/v1/client/sign_ups')) signUpRequests += 1;
    if (
      scenario === 'account-mismatch' &&
      request.method() === 'POST' &&
      request.url().includes('/oauth/authorize/account-selection')
    ) {
      const form = new URLSearchParams(request.postData() || '');
      const authorizationURL = form.get('authorization_url');
      if (authorizationURL) accountChoiceAuthorizationParams = new URL(authorizationURL).searchParams;
    }
    void request.allHeaders().then(headers => {
      const cookieNames = (headers.cookie || '')
        .split(/;\s*/)
        .filter(Boolean)
        .map(cookie => cookie.split('=', 1)[0]);
      if (request.isNavigationRequest() || cookieNames.length) {
        const body = request.method() === 'POST' ? request.postData() : null;
        const bodyFields = body ? [...new URLSearchParams(body).keys()].join(',') : '';
        console.log(
          `[siwc-trace] request ${request.method()} ${safeURL(request.url())}${cookieNames.length ? ` cookies=${cookieNames.join(',')}` : ''}${bodyFields ? ` body_fields=${bodyFields}` : ''}`,
        );
      }
    });
  });
  page.context().on('response', async response => {
    if (response.url().includes('/v1/oauth_callback')) innerCallbackResponses += 1;
    if (!response.request().isNavigationRequest()) return;
    const headers = await response.allHeaders();
    const location = headers.location ? ` location=${safeURL(new URL(headers.location, response.url()).href)}` : '';
    const scopes = (headers['set-cookie'] || '')
      .split(/,(?=[^;,]+=)/)
      .map(cookie => {
        const [name] = cookie.trim().split('=', 1);
        const domain = cookie.match(/;\s*Domain=([^;,]+)/i)?.[1] || '(host-only)';
        return `${name}@${domain}`;
      })
      .join(',');
    console.log(
      `[siwc-trace] response ${response.status()} ${safeURL(response.url())}${location}${scopes ? ` cookies=${scopes}` : ''}`,
    );
  });

  page.on('requestfailed', request => {
    if (request.isNavigationRequest())
      console.log(`[siwc-trace] failed ${safeURL(request.url())} ${request.failure()?.errorText}`);
  });

  await page.context().route(/.*/, async route => {
    const request = route.request();
    const url = new URL(request.url());

    const mapRedirect = (location: string): string => {
      const redirect = new URL(location, url.href);
      if (redirect.hostname === callbackHost) {
        return `${bridgeOrigin}/__chatgpt_callback${redirect.search}`;
      }
      if (redirect.hostname === host) {
        return `${bridgeOrigin}${redirect.pathname}${redirect.search}`;
      }
      if (redirect.hostname === accountsHost) {
        return `${bridgeOrigin}${redirect.pathname}${redirect.search}`;
      }
      if (redirect.origin === issuerOrigin) {
        return `${bridgeOrigin}/_issuer${redirect.pathname}${redirect.search}`;
      }
      return location;
    };

    const fulfillWithMappedRedirect = async (response: Awaited<ReturnType<typeof route.fetch>>) => {
      const location = response.headers().location;
      if (location) {
        const mapped = mapRedirect(location);
        if (mapped !== location) {
          await route.fulfill({ response, headers: { ...response.headers(), location: mapped } });
          return;
        }
      }
      await route.fulfill({ response });
    };

    const isLocalUI = url.origin === uiOrigin;
    if (url.origin === bridgeOrigin) {
      if (url.pathname.startsWith('/proxy/')) {
        const browserOrigin = request.headers().origin;
        const response = await route.fetch({
          headers: { ...request.headers(), origin: `https://${accountsHost}` },
          maxRedirects: 0,
        });
        const responseHeaders = { ...response.headers() };
        if (browserOrigin) {
          responseHeaders['access-control-allow-origin'] = browserOrigin;
          responseHeaders['access-control-allow-credentials'] = 'true';
        }
        if (responseHeaders['set-cookie']) {
          responseHeaders['set-cookie'] = responseHeaders['set-cookie'].replace(/;\s*Domain=[^;,]+/gi, '');
        }
        const location = response.headers().location;
        if (location) responseHeaders.location = mapRedirect(location);
        let body: string | undefined;
        if (url.pathname.endsWith('/v1/client/sign_ins') && response.status() < 300) {
          body = await response.text();
          if (scenario === 'enterprise-sso') {
            try {
              const signIn = JSON.parse(body);
              enterpriseFirstFactorStrategies = (signIn.response?.supported_first_factors ?? []).map(
                (factor: { strategy?: string }) => factor.strategy || '',
              );
            } catch {
              enterpriseFirstFactorStrategies = [];
            }
          }
          body = body.replaceAll(issuerOrigin, `${bridgeOrigin}/_issuer`);
        } else if (scenario === 'enterprise-sso' && url.pathname.includes('/prepare_first_factor')) {
          body = await response.text();
          body = body.replaceAll(enterpriseOAuthOrigin, `${bridgeOrigin}/_enterprise_oauth`);
        } else if (url.pathname.endsWith('/v1/client') && scenario === 'account-mismatch') {
          body = await response.text();
          try {
            const client = JSON.parse(body);
            console.log(`[siwc-trace] mismatch client session_count=${client.response?.sessions?.length ?? 'unknown'}`);
          } catch {
            console.log(`[siwc-trace] mismatch client response status=${response.status()} invalid_json=true`);
          }
        }
        await route.fulfill({ response, headers: responseHeaders, body });
        return;
      }
      await route.continue();
      return;
    }
    if (url.hostname === accountsHost && request.isNavigationRequest()) {
      await route.fulfill({
        status: 302,
        headers: { location: `${bridgeOrigin}${url.pathname}${url.search}` },
      });
      return;
    }
    if (url.origin === issuerOrigin) {
      // The synthetic issuer receives Clerk's real-host callback URI. Point
      // its test-only response at the bridge so the browser keeps the bridge
      // cookie jar while traversing the callback.
      const issuerRequest = new URL(url);
      const redirectUri = issuerRequest.searchParams.get('redirect_uri');
      if (redirectUri) {
        const callback = new URL(redirectUri);
        issuerRequest.searchParams.set('redirect_uri', `${bridgeOrigin}${callback.pathname}${callback.search}`);
      }
      await fulfillWithMappedRedirect(await route.fetch({ url: issuerRequest.href, maxRedirects: 0 }));
      return;
    }

    const isFAPI =
      url.hostname === host || url.hostname === fapiHost || url.hostname === accountsHost || url.origin === fapiOrigin;
    if (!isFAPI && !isLocalUI) {
      await route.continue();
      return;
    }

    const isHostedUI =
      isLocalUI ||
      url.pathname === '/sign-in' ||
      url.pathname === '/sign-up' ||
      url.pathname === '/oauth-consent' ||
      request.resourceType() === 'script' ||
      request.resourceType() === 'stylesheet';
    if (isHostedUI) {
      // Rspack serves the sandbox template at `/`; the browser keeps the
      // hosted Clerk URL so the sandbox app still mounts its path component.
      const localPath =
        isLocalUI || url.pathname === '/sign-in' || url.pathname === '/sign-up' || url.pathname === '/oauth-consent'
          ? '/'
          : url.pathname;
      const response = await route.fetch({ url: `${uiOrigin}${localPath}${url.search}` });
      let body = await response.text();
      body = body.replace(
        /data-clerk-publishable-key="[^"]+"/,
        `data-clerk-publishable-key="${publishableKey}" data-clerk-proxy-url="${bridgeOrigin}/proxy"`,
      );
      await route.fulfill({ response, body });
      return;
    }

    const requestHost = url.hostname === fapiHost ? fapiHost : host;
    const headers = {
      ...request.headers(),
      host: requestHost,
      'x-original-host': requestHost,
      origin: `https://${accountsHost}`,
    };
    const response = await route.fetch({
      url: `${fapiOrigin}${url.pathname}${url.search}`,
      headers,
      maxRedirects: 0,
    });
    const browserOrigin = request.headers().origin;
    if (browserOrigin) {
      const responseHeaders = {
        ...response.headers(),
        'access-control-allow-origin': browserOrigin,
        'access-control-allow-credentials': 'true',
      };
      // FAPI responses name the synthetic production host in Domain. The
      // browser is exercising the flow on loopback, so retain the cookies as
      // host-only loopback cookies for the test journey.
      if (responseHeaders['set-cookie']) {
        responseHeaders['set-cookie'] = responseHeaders['set-cookie'].replace(/;\s*Domain=[^;,]+/gi, '');
      }
      const location = response.headers().location;
      if (location) {
        responseHeaders.location = mapRedirect(location);
      }
      await route.fulfill({
        response,
        headers: responseHeaders,
      });
      return;
    }
    await fulfillWithMappedRedirect(response);
  });

  if (scenario === 'account-mismatch') {
    const fixtureCookies = JSON.parse(env('CHATGPT_SIWC_PREAUTH_COOKIES')) as Array<{
      Name?: string;
      Value?: string;
      name?: string;
      value?: string;
    }>;
    await page.context().addCookies([
      ...fixtureCookies.map(cookie => ({
        name: cookie.name ?? cookie.Name ?? '',
        value: cookie.value ?? cookie.Value ?? '',
        url: bridgeOrigin,
      })),
      { name: '__client', value: env('CHATGPT_SIWC_CLIENT_COOKIE'), url: bridgeOrigin },
      { name: '__session', value: env('CHATGPT_SIWC_PREAUTH_SESSION'), url: bridgeOrigin },
    ]);
  }

  const authorize = new URL('/oauth/authorize', `https://${host}`);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', callbackUri);
  authorize.searchParams.set('scope', 'profile email');
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', challenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  authorize.searchParams.set('resource', resource);
  authorize.searchParams.set('target_flow', 'chatgpt_siwc');
  authorize.searchParams.set('login_hint', env('CHATGPT_SIWC_LOGIN_HINT'));

  await page.goto(`${bridgeOrigin}${authorize.pathname}${authorize.search}`);
  await expectPath(/\/sign-in/);
  const signInContinuationURL = page.url();
  if (scenario === 'account-mismatch') {
    await expectQueryParam('__clerk_siwc_account_mismatch', 'true');
    await expect(page.getByText('Add account', { exact: true })).toBeVisible();
    const selectedAccount = page.getByRole('button').filter({ hasText: expectedEmail }).first();
    await expect(selectedAccount).toBeVisible();
    await selectedAccount.click();
  } else if (scenario === 'new-account') {
    const signUpLink = page.getByRole('link', { name: 'Sign up', exact: true });
    const accountCreationStep = await Promise.race([
      signUpLink.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'sign-up-form'),
      page.waitForURL(url => url.pathname === '/oauth-consent', { timeout: 30000 }).then(() => 'automatic-sign-up'),
    ]);
    if (accountCreationStep === 'sign-up-form') {
      await signUpLink.dispatchEvent('click');
      await expectPath(/\/sign-up/);
      await expectQueryParam('target_flow', 'chatgpt_siwc');
      expect(new URL(page.url()).searchParams.has('redirect_url')).toBeTruthy();
      await expect(page.getByRole('button', { name: /chatgpt/i }).first()).toBeVisible();
      await page
        .getByRole('button', { name: /chatgpt/i })
        .first()
        .click();
    }
    await expect.poll(() => signUpRequests).toBeGreaterThan(0);
  } else if (scenario === 'provider-denial-retry') {
    const providerButton = page.getByRole('button', { name: /chatgpt/i }).first();
    const autoStarted = await expect
      .poll(() => issuerAuthorizationRequests, { timeout: 1500 })
      .toBeGreaterThan(0)
      .then(() => true)
      .catch(() => false);
    if (!autoStarted) {
      await expect(providerButton).toBeEnabled();
      await providerButton.click();
    }
  } else if (scenario === 'enterprise-sso') {
    await expect.poll(() => enterpriseSSOAuthRequests).toBeGreaterThan(0);
    await expect.poll(() => enterpriseFirstFactorStrategies.length).toBeGreaterThan(0);
    expect(enterpriseFirstFactorStrategies).toEqual(['enterprise_sso']);
    await expectPath(/\/oauth-consent/);
    // Enterprise-only policy routes to its configured IdP. OpenAI's issuer is
    // never started, so ChatGPT identity cannot bypass the required SSO step.
    expect(issuerAuthorizationRequests).toBe(0);
  } else {
    const providerButton = page.getByRole('button', { name: /chatgpt/i }).first();
    const nextStep = await Promise.race([
      expect
        .poll(() => issuerAuthorizationRequests, { timeout: 1500 })
        .toBeGreaterThan(0)
        .then(() => 'provider-started')
        .catch(() => 'provider-not-started'),
      page
        .waitForURL(url => url.pathname === '/oauth-consent', { timeout: 10000 })
        .then(() => 'consent')
        .catch(() => 'consent-not-reached'),
    ]);
    if (nextStep === 'provider-not-started' || nextStep === 'consent-not-reached') {
      await expect(providerButton).toBeEnabled();
      await providerButton.click();
    }
  }

  if (scenario === 'provider-denial-retry') {
    await expect.poll(() => issuerAuthorizationRequests).toBeGreaterThan(0);
    await expect.poll(() => innerCallbackResponses).toBeGreaterThan(0);
    const clientAfterDenialResponse = await page
      .context()
      .request.get(`${bridgeOrigin}/proxy/v1/client?__clerk_api_version=2026-05-12&_clerk_js_version=6.38.0`);
    const clientAfterDenial = await clientAfterDenialResponse.json();
    expect(clientAfterDenial.response?.sessions ?? []).toHaveLength(0);
    if (!new URL(page.url()).pathname.startsWith('/sign-in')) {
      await page.goto(signInContinuationURL);
      await expectPath(/\/sign-in/);
    }
    const retryButton = page.getByRole('button', { name: /chatgpt/i }).first();
    const retryStep = await Promise.race([
      expect
        .poll(() => issuerAuthorizationRequests, { timeout: 1500 })
        .toBeGreaterThan(1)
        .then(() => 'provider-started')
        .catch(() => 'provider-not-started'),
      retryButton
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => 'retry-button')
        .catch(() => 'retry-button-unavailable'),
    ]);
    if (retryStep !== 'provider-started' && issuerAuthorizationRequests <= 1) {
      await expect(retryButton).toBeEnabled();
      await retryButton.dispatchEvent('click');
    }
    await expect.poll(() => issuerAuthorizationRequests).toBeGreaterThan(1);
  }

  await expectPath(/\/oauth-consent/);
  if (scenario === 'account-mismatch') {
    expect(issuerAuthorizationRequests).toBe(0);
  } else if (scenario === 'enterprise-sso') {
    expect(enterpriseSSOAuthRequests).toBeGreaterThan(0);
    expect(enterpriseFirstFactorStrategies).toEqual(['enterprise_sso']);
    expect(issuerAuthorizationRequests).toBe(0);
  } else {
    expect(innerState).toBeTruthy();
    expect(innerState).not.toBe(state);
    expect(innerNonce).toBeTruthy();
    expect(innerChallenge).toBeTruthy();
    expect(innerChallenge).not.toBe(challenge);
  }
  await expect(page.getByText('synthetic-chatgpt-plugin', { exact: true })).toBeVisible();
  await expect(page.getByText('Grants access to your profile', { exact: true })).toBeVisible();
  await expect(page.getByText('Grants access to your email', { exact: true })).toBeVisible();
  if (scenario === 'consent-interrupted') {
    const consentURL = page.url();
    await page.goBack();
    expect(new URL(page.url()).pathname).not.toContain('__chatgpt_callback');
    await page.goto(consentURL);
    await expectPath(/\/oauth-consent/);
    await expect(page.getByRole('button', { name: 'Allow' })).toBeVisible();
  }

  if (scenario === 'consent-denied') {
    await page.getByRole('button', { name: 'Deny' }).click();
    await expectPath(/__chatgpt_callback/);
    await assertConsentSubmissionBoundToSession(page, bridgeOrigin, consentSessionIDs);
    const denial = new URL(page.url());
    expect(denial.searchParams.get('state')).toBe(state);
    expect(denial.searchParams.get('error')).toBe('access_denied');
    expect(denial.searchParams.get('code')).toBeNull();
    return;
  }

  await page.getByRole('button', { name: 'Allow' }).click();
  if (scenario === 'consent-interrupted') expect(consentSubmissions).toBe(1);

  await expectPath(/__chatgpt_callback/);
  const callback = new URL(page.url());
  expect(callback.searchParams.get('state')).toBe(state);
  await assertConsentSubmissionBoundToSession(page, bridgeOrigin, consentSessionIDs);
  const code = callback.searchParams.get('code');
  expect(code).toBeTruthy();

  const api = await playwrightRequest.newContext({
    extraHTTPHeaders: { host: fapiHost, 'x-original-host': fapiHost },
  });
  try {
    const tokenResponse = await api.post(`${fapiOrigin}/oauth/token`, {
      form: {
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code!,
        redirect_uri: callbackUri,
        code_verifier: verifier,
        resource,
      },
    });
    expect(tokenResponse.ok(), await tokenResponse.text()).toBeTruthy();
    const token = await tokenResponse.json();
    expect(token.access_token).toBeTruthy();
    expect(token.id_token).toBeUndefined();

    const userinfoResponse = await api.get(`${fapiOrigin}/oauth/userinfo`, {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    expect(userinfoResponse.ok(), await userinfoResponse.text()).toBeTruthy();
    const userinfo = await userinfoResponse.json();
    expect(userinfo.email).toBe(expectedEmail);
    expect(userinfo.email_verified).toBe(true);

    if (scenario === 'consent-reuse') {
      const secondState = `${state}-reuse`;
      const secondVerifier = randomBytes(32).toString('base64url');
      const secondChallenge = createHash('sha256').update(secondVerifier).digest('base64url');
      const secondAuthorize = new URL('/oauth/authorize', `https://${host}`);
      secondAuthorize.searchParams.set('response_type', 'code');
      secondAuthorize.searchParams.set('client_id', clientId);
      secondAuthorize.searchParams.set('redirect_uri', callbackUri);
      secondAuthorize.searchParams.set('scope', 'profile email');
      secondAuthorize.searchParams.set('state', secondState);
      secondAuthorize.searchParams.set('code_challenge', secondChallenge);
      secondAuthorize.searchParams.set('code_challenge_method', 'S256');
      secondAuthorize.searchParams.set('resource', resource);
      secondAuthorize.searchParams.set('target_flow', 'chatgpt_siwc');
      secondAuthorize.searchParams.set('login_hint', expectedEmail);
      await page.goto(`${bridgeOrigin}${secondAuthorize.pathname}${secondAuthorize.search}`);
      const secondStep = await Promise.race([
        page
          .waitForURL(url => url.pathname === '/oauth-consent', { timeout: 10000 })
          .then(() => 'consent')
          .catch(() => 'timeout'),
        page
          .waitForURL(url => url.pathname === '/__chatgpt_callback', { timeout: 10000 })
          .then(() => 'callback')
          .catch(() => 'timeout'),
      ]);
      if (secondStep === 'consent') {
        await expect(page.getByRole('button', { name: 'Allow' })).toBeVisible();
        await page.getByRole('button', { name: 'Allow' }).click();
      }
      await expectPath(/__chatgpt_callback/);
      const secondCallback = new URL(page.url());
      expect(secondCallback.searchParams.get('state')).toBe(secondState);
      expect(secondCallback.searchParams.get('code')).toBeTruthy();
      // The second authorization reuses the Clerk session without another
      // OpenAI transaction. The current OAuth surface does not persist grants,
      // so a consent-enabled app may ask for consent again.
      expect(issuerAuthorizationRequests).toBe(1);
      expect(consentSubmissions).toBe(secondStep === 'consent' ? 2 : 1);

      const secondTokenResponse = await api.post(`${fapiOrigin}/oauth/token`, {
        form: {
          grant_type: 'authorization_code',
          client_id: clientId,
          code: secondCallback.searchParams.get('code')!,
          redirect_uri: callbackUri,
          code_verifier: secondVerifier,
          resource,
        },
      });
      expect(secondTokenResponse.ok(), await secondTokenResponse.text()).toBeTruthy();
      expect((await secondTokenResponse.json()).access_token).toBeTruthy();
    }
  } finally {
    await api.dispose();
  }
});

async function assertConsentSubmissionBoundToSession(
  page: import('@playwright/test').Page,
  bridgeOrigin: string,
  submittedSessionIDs: string[],
) {
  expect(submittedSessionIDs).toHaveLength(1);
  const sessionCookie = (await page.context().cookies(bridgeOrigin)).find(cookie => cookie.name === '__session');
  expect(sessionCookie).toBeTruthy();
  const claims = JSON.parse(Buffer.from(sessionCookie!.value.split('.')[1], 'base64url').toString());
  expect(claims.sid).toBe(submittedSessionIDs[0]);
}
