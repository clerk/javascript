import { runWithExponentialBackOff } from './utils';

const NO_DOCUMENT_ERROR = 'loadScript cannot be called when document does not exist';
const NO_SRC_ERROR = 'loadScript cannot be called without a src';

type LoadScriptOptions = {
  async?: boolean;
  defer?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
  nonce?: string;
  integrity?: string;
  beforeLoad?: (script: HTMLScriptElement) => void;
};

export async function loadScript(src = '', opts: LoadScriptOptions): Promise<HTMLScriptElement> {
  const { async, defer, beforeLoad, crossOrigin, nonce, integrity } = opts || {};

  const load = () => {
    return new Promise<HTMLScriptElement>((resolve, reject) => {
      if (!src) {
        reject(NO_SRC_ERROR);
      }

      if (!document || !document.body) {
        reject(NO_DOCUMENT_ERROR);
      }

      const script = document.createElement('script');

      crossOrigin && script.setAttribute('crossorigin', crossOrigin);
      integrity && script.setAttribute('integrity', integrity);
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
  };

  return runWithExponentialBackOff(load, { shouldRetry: (_, iterations) => iterations < 5 });
}
