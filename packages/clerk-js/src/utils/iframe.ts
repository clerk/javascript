type RunIframeOptions = {
  src: string;
  eventOrigin: string;
};

export function runIframe<T>({ src, eventOrigin }: RunIframeOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.setAttribute(
      'style',
      'display: none; position: fixed; z-index: 2147483646; background-color: rgba(100,100,100,0.8); top: 0; left: 0; bottom: 0; right: 0;',
    );

    const iframe = document.createElement('iframe');
    iframe.src = src;

    // TODO: Auto adjust IFrame width & height using post message
    iframe.setAttribute(
      'style',
      'display: none; position: fixed; z-index: 2147483647; border-radius: 32px; width: 600px; height: 500px; left: 50%; top: 50%; transform: translate(-50%, -50%); border: 0; outline: 0; background-color: white; box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);',
    );

    const iframeAttributes = ['allow-same-origin', 'allow-scripts', 'allow-top-navigation'];

    if (typeof document.requestStorageAccess === 'function') {
      iframeAttributes.push('allow-storage-access-by-user-activation');
    }

    iframe.setAttribute('sandbox', iframeAttributes.join(' '));

    function renderIframe() {
      window.addEventListener('message', onMessage, false);
      document.body.appendChild(overlay);
      document.body.appendChild(iframe);
    }

    function removeIframe() {
      overlay?.remove();
      iframe?.remove();
      window.removeEventListener('message', onMessage, false);
    }

    function showIframe() {
      iframe.style.display = 'block';
      overlay.style.display = 'block';
    }

    function onMessage(event: MessageEvent) {
      if (event.origin != eventOrigin) {
        return;
      }

      if (event.data.error) {
        removeIframe();
        reject(event.data.error);
      } else if (event.data.showFrame) {
        showIframe();
      } else {
        removeIframe();
        resolve(event.data);
      }
    }

    renderIframe();
  });
}
