const FAILED_TO_FIND_CLERK_SCRIPT = 'Clerk: Failed find clerk-js script';

// TODO-SHARED: Something similar exists inside clerk-react
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
