import { buildAccountsBaseUrl } from '@clerk/shared/buildAccountsBaseUrl';
import type { AuthenticateWithPopupParams, AuthenticateWithRedirectParams } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';

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

  const accountPortalHost = buildAccountsBaseUrl(client.frontendApi);

  const { redirectUrl } = params;

  // We set the force_redirect_url query parameter to ensure that the user is redirected to the correct page even
  // in situations like a modal transfer flow.
  const r = new URL(redirectUrl);
  r.searchParams.set('sign_in_force_redirect_url', params.redirectUrlComplete);
  r.searchParams.set('sign_up_force_redirect_url', params.redirectUrlComplete);
  r.searchParams.set('intent', reloadResource);
  // All URLs are decorated with the dev browser token in development mode since we're moving between AP and the app.
  const redirectUrlWithForceRedirectUrl = client.buildUrlWithAuth(r.toString());

  const popupRedirectUrlComplete = client.buildUrlWithAuth(`${accountPortalHost}/popup-callback`);
  const popupRedirectUrl = client.buildUrlWithAuth(
    `${accountPortalHost}/popup-callback?return_url=${encodeURIComponent(redirectUrlWithForceRedirectUrl)}`,
  );

  const messageHandler = async (event: MessageEvent) => {
    if (event.origin !== accountPortalHost) {
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
 * Creates new redirect and callback URLs that point to the `/popup-callback` route on Account Portal. These URLs will
 * be used by FAPI to redirect after the OAuth flow completes, and will result in a message being sent to the parent
 * window.
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
): { redirectCallbackUrl: string; redirectUrl: string } {
  const accountPortalHost = buildAccountsBaseUrl(client.frontendApi);

  // We set the force_redirect_url query parameter to ensure that the user is redirected to the correct page even
  // in situations like a modal transfer flow.
  const r = new URL(redirectCallbackUrl);
  r.searchParams.set('sign_in_force_redirect_url', redirectUrl);
  r.searchParams.set('sign_up_force_redirect_url', redirectUrl);
  // All URLs are decorated with the dev browser token in development mode since we're moving between AP and the app.
  const redirectUrlWithForceRedirectUrl = client.buildUrlWithAuth(r.toString());

  const popupRedirectUrlComplete = client.buildUrlWithAuth(`${accountPortalHost}/popup-callback`);
  const popupRedirectUrl = client.buildUrlWithAuth(
    `${accountPortalHost}/popup-callback?return_url=${encodeURIComponent(redirectUrlWithForceRedirectUrl)}`,
  );

  return { redirectCallbackUrl: popupRedirectUrl, redirectUrl: popupRedirectUrlComplete };
}

export function _futureAuthenticateWithPopup(
  client: Clerk,
  params: { popup: { location: { href: string } }; externalVerificationRedirectURL: URL },
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!client.client || !params.popup) {
      reject();
      return;
    }

    const messageHandler = async (event: MessageEvent) => {
      if (event.origin !== buildAccountsBaseUrl(client.frontendApi)) {
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
