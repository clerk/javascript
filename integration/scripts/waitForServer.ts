type WaitForServerArgsType = {
  log;
  delayInMs?: number;
  maxAttempts?: number;
  shouldExit?: () => boolean;
};

// Poll a url until it returns a 200 status code
export const waitForServer = async (url: string, opts: WaitForServerArgsType) => {
  const { log, delayInMs = 1000, maxAttempts = 20, shouldExit = () => false } = opts;
  let attempts = 0;
  while (attempts < maxAttempts) {
    if (shouldExit()) {
      throw new Error(`Polling ${url} failed after ${maxAttempts} attempts (due to forced exit)`);
    }

    try {
      log(`Polling ${url}...`);
      const res = await fetch(url);
      if (res.ok) {
        return Promise.resolve();
      }
    } catch {
      // ignore
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, delayInMs));
  }

  throw new Error(`Polling ${url} failed after ${maxAttempts} attempts`);
};
