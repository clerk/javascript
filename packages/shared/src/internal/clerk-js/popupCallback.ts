import { buildAccountsBaseUrl } from '../../buildAccountsBaseUrl';
import { ClerkRuntimeError } from '../../errors/clerkRuntimeError';

export const POPUP_CLOSED_ERROR_CODE = 'popup_closed';

export function buildPopupCallbackUrls(
  frontendApi: string,
  buildUrlWithAuth: (url: string) => string,
  returnUrl: string,
): { accountsOrigin: string; redirectUrl: string; redirectUrlComplete: string } {
  const accountsOrigin = buildAccountsBaseUrl(frontendApi);
  return {
    accountsOrigin,
    redirectUrl: buildUrlWithAuth(`${accountsOrigin}/popup-callback?return_url=${encodeURIComponent(returnUrl)}`),
    redirectUrlComplete: buildUrlWithAuth(`${accountsOrigin}/popup-callback`),
  };
}

export function waitForPopupCallback(popup: Window, url: string, accountsOrigin: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener('message', onMessage);
      clearInterval(interval);
      fn();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== accountsOrigin || (event.source && event.source !== popup)) {
        return;
      }
      if (event.data?.session || event.data?.return_url) {
        settle(resolve);
      }
    };
    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        setTimeout(
          () =>
            settle(() =>
              reject(
                new ClerkRuntimeError('The popup was closed before the flow completed', {
                  code: POPUP_CLOSED_ERROR_CODE,
                }),
              ),
            ),
          1000,
        );
      }
    }, 500);

    window.addEventListener('message', onMessage);
    popup.location.href = url;
  });
}
