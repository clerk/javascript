const FAILED_TO_FIND_CLERK_SCRIPT = 'Clerk: Failed find clerk-js script';

export const waitForClerkScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.querySelector('script[data-clerk-script]');

    if (!script) {
      return reject(FAILED_TO_FIND_CLERK_SCRIPT);
    }

    script.addEventListener('load', () => {
      script.remove();
      resolve(script);
    });
  });
};
