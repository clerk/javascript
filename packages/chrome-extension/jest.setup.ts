import { chrome } from 'jest-chrome';

// @ts-expect-error - Mock implementation
chrome.runtime.id = 'chrome-extension-test';

Object.assign(globalThis, { chrome, browser: chrome });
