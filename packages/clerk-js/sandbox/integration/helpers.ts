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

export function createColorMixRunner(fn: (page: Page) => Promise<void>) {
  return async (page: Page) => {
    await fn(page);
    await disableColorMix(page);
    await fn(page);
  };
}
