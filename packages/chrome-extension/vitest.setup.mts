import * as vitestChrome from 'vitest-chrome';

const { chrome } = vitestChrome;

// @ts-expect-error - required for the browser polyfill
chrome.runtime.id = 'chrome-extension-test';
Object.assign(globalThis, vitestChrome, { browser: chrome });
