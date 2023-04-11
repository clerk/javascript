type LoadScriptOptions = {
  async?: boolean;
  defer?: boolean;
  globalObject?: unknown;
};

export async function loadScript(src = '', { async, defer, globalObject }: LoadScriptOptions = {}) {
  if (!src) {
    throw 'Missing script src...';
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (globalObject) {
      return resolve(existingScript);
    }

    if (existingScript && globalObject) {
      resolve(existingScript);
    }

    const script = document.createElement('script');

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
    document.body.appendChild(script);
  });
}
