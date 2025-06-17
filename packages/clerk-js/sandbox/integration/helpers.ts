import { clerk } from '@clerk/testing/playwright';
import type { Page } from '@playwright/test';

export async function disableColorMix(page: Page) {
  await page.addInitScript(() => {
    window.ClerkCSSSupport = {
      ...window.ClerkCSSSupport,
      colorMix: false,
    };
  });
}

export async function waitForClerkLoaded(page: Page, selector: string) {
  await clerk.loaded({ page });
  await page.waitForSelector(selector, { state: 'attached' });
}

// export function createColorMixRunner(path: string, waitForClerkElement: string, fn: (page: Page) => Promise<void>) {
//   return async (page: Page) => {
//     await page.goto(path);
//     await waitForClerkLoaded(page, waitForClerkElement);
//     await fn(page);

//     await disableColorMix(page);

//     await page.reload();
//     await waitForClerkLoaded(page, waitForClerkElement);
//     await fn(page);
//   };
// }

type ColorMixRunnerOptions = {
  path: string;
  waitForClerkElement: string;
  fn: (page: Page) => Promise<void>;
};

export function createColorMixRunner({ path, waitForClerkElement, fn }: ColorMixRunnerOptions) {
  return async (page: Page) => {
    await page.goto(path);
    await waitForClerkLoaded(page, waitForClerkElement);
    await fn(page);

    await disableColorMix(page);

    await page.reload();
    await waitForClerkLoaded(page, waitForClerkElement);
    await fn(page);
  };
}
