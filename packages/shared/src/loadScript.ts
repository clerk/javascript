const NO_DOCUMENT_ERROR = 'loadScript cannot be called when document does not exist';
const NO_SRC_ERROR = 'loadScript cannot be called without a src';

type LoadScriptOptions = {
  async?: boolean;
  defer?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
  nonce?: string;
  beforeLoad?: (script: HTMLScriptElement) => void;
};

export async function loadScript(src = '', opts: LoadScriptOptions): Promise<HTMLScriptElement> {
  const { async, defer, beforeLoad, crossOrigin, nonce } = opts || {};
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(NO_SRC_ERROR);
    }

    if (!document || !document.body) {
      reject(NO_DOCUMENT_ERROR);
    }

    const script = document.createElement('script');

    crossOrigin && script.setAttribute('crossorigin', crossOrigin);
    script.async = async || false;
    script.defer = defer || false;

    script.addEventListener('load', () => {
      script.remove();
      resolve(script);
    });

    script.addEventListener('error', () => {
      script.remove();
      reject();
    });

    script.src = src;
    script.nonce = nonce;
    beforeLoad?.(script);
    document.body.appendChild(script);
  });
}
