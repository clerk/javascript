import { retry } from './retry';

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

  const load = () => {
    return new Promise<HTMLScriptElement>((resolve, reject) => {
      if (!src) {
        reject(new Error(NO_SRC_ERROR));
      }

      if (!document || !document.body) {
        reject(new Error(NO_DOCUMENT_ERROR));
      }

      const script = document.createElement('script');

      if (crossOrigin) {
        script.setAttribute('crossorigin', crossOrigin);
      }
      script.async = async || false;
      script.defer = defer || false;

      script.addEventListener('load', () => {
        script.remove();
        resolve(script);
      });

      script.addEventListener('error', event => {
        script.remove();
        reject(event.error ?? new Error(`failed to load script: ${src}`));
      });

      script.src = src;
      script.nonce = nonce;
      beforeLoad?.(script);
      document.body.appendChild(script);
    });
  };

  return retry(load, { shouldRetry: (_, iterations) => iterations <= 5 });
}
