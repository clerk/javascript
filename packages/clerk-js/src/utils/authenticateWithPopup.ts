import type { AuthenticateWithPopupParams, AuthenticateWithRedirectParams } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';

const popupCallbackPath = '/popup_auth_callback';

const createPopupState = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');

const buildPopupCallbackUrls = (client: Clerk, state: string, returnUrl: string) => {
  const callbackUrl = client.getFapiClient().buildUrl({
    path: popupCallbackPath,
    search: { state },
  });
  const popupRedirectUrlComplete = client.buildUrlWithAuth(callbackUrl.toString());
  const popupRedirectUrl = new URL(popupRedirectUrlComplete);
  popupRedirectUrl.searchParams.set('return_url', returnUrl);

  return {
    callbackOrigin: callbackUrl.origin,
    popupRedirectUrl: popupRedirectUrl.toString(),
    popupRedirectUrlComplete,
  };
};

export async function _authenticateWithPopup(
  client: Clerk,
  reloadResource: 'signIn' | 'signUp',
  authenticateMethod: (
    params: AuthenticateWithRedirectParams,
    navigateCallback: (url: URL | string) => void,
  ) => Promise<void>,
  params: AuthenticateWithPopupParams & {
    unsafeMetadata?: SignUpUnsafeMetadata;
  },
  navigateCallback: (url: URL | string) => void,
): Promise<void> {
  if (!client.client || !params.popup) {
    return;
  }

  const { redirectUrl } = params;

  // We set the force_redirect_url query parameter to ensure that the user is redirected to the correct page even
  // in situations like a modal transfer flow.
  const r = new URL(redirectUrl);
  r.searchParams.set('sign_in_force_redirect_url', params.redirectUrlComplete);
  r.searchParams.set('sign_up_force_redirect_url', params.redirectUrlComplete);
  r.searchParams.set('intent', reloadResource);
  const redirectUrlWithForceRedirectUrl = client.buildUrlWithAuth(r.toString());
  const state = createPopupState();
  const { callbackOrigin, popupRedirectUrl, popupRedirectUrlComplete } = buildPopupCallbackUrls(
    client,
    state,
    redirectUrlWithForceRedirectUrl,
  );

  const messageHandler = async (event: MessageEvent) => {
    if (event.origin !== callbackOrigin || event.source !== params.popup || event.data?.state !== state) {
      return;
    }

    let shouldRemoveListener = false;

    if (event.data.session) {
      const existingSession = client.client?.sessions.find(x => x.id === event.data.session) || null;
      if (!existingSession) {
        try {
          await client.client?.reload();
        } catch (e) {
          console.error(e);
        }
      }
      await client.setActive({
        session: event.data.session,
        redirectUrl: params.redirectUrlComplete,
      });
      shouldRemoveListener = true;
    } else if (event.data.return_url) {
      client.navigate(event.data.return_url);
      shouldRemoveListener = true;
    }

    if (shouldRemoveListener) {
      window.removeEventListener('message', messageHandler);
    }
  };

  window.addEventListener('message', messageHandler);

  await authenticateMethod(
    {
      ...params,
      redirectUrlComplete: popupRedirectUrlComplete,
      redirectUrl: popupRedirectUrl,
    },
    navigateCallback,
  );
}

/**
 * Creates new redirect and callback URLs that point to FAPI's popup callback route.
 */
export function wrapWithPopupRoutes(
  client: Clerk,
  {
    redirectCallbackUrl,
    redirectUrl,
  }: {
    /**
     * The route to navigate to if a session was not created.
     */
    redirectCallbackUrl: string;
    /**
     * The route to navigate to if a session was created.
     */
    redirectUrl: string;
  },
): { redirectCallbackUrl: string; redirectUrl: string; state: string } {
  // We set the force_redirect_url query parameter to ensure that the user is redirected to the correct page even
  // in situations like a modal transfer flow.
  const r = new URL(redirectCallbackUrl);
  r.searchParams.set('sign_in_force_redirect_url', redirectUrl);
  r.searchParams.set('sign_up_force_redirect_url', redirectUrl);
  const redirectUrlWithForceRedirectUrl = client.buildUrlWithAuth(r.toString());
  const state = createPopupState();
  const { popupRedirectUrl, popupRedirectUrlComplete } = buildPopupCallbackUrls(
    client,
    state,
    redirectUrlWithForceRedirectUrl,
  );

  return { redirectCallbackUrl: popupRedirectUrl, redirectUrl: popupRedirectUrlComplete, state };
}

export function _futureAuthenticateWithPopup(
  client: Clerk,
  params: { popup: Window; externalVerificationRedirectURL: URL; state: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!client.client || !params.popup) {
      reject();
      return;
    }

    const callbackOrigin = client.getFapiClient().buildUrl({ path: popupCallbackPath }).origin;
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== callbackOrigin || event.source !== params.popup || event.data?.state !== params.state) {
        return;
      }

      // The OAuth flow was successful, and we received a message with either a session or a return URL.
      if (event.data.session || event.data.return_url) {
        window.removeEventListener('message', messageHandler);
        resolve();
      } else {
        reject();
      }
    };

    // Listen for messages from the popup window.
    window.addEventListener('message', messageHandler);

    // Navigate the popup window to the external verification redirect URL, which kicks off the OAuth flow.
    params.popup.location.href = params.externalVerificationRedirectURL.toString();
  });
}
