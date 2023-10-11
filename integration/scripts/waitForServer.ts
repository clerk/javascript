// Poll a url until it returns a 200 status code
export const waitForServer = async (url: string, opts: { delayInMs?: number; maxAttempts?: number; log }) => {
  const { delayInMs = 1000, maxAttempts = 20, log } = opts || {};
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      log(`Polling ${url}...`);
      const res = await fetch(url);
      if (res.ok) {
        return Promise.resolve();
      }
    } catch (e) {
      // ignore
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, delayInMs));
  }
  throw new Error(`Polling ${url} failed after ${maxAttempts} attempts`);
};
