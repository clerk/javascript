import { chrome } from 'jest-chrome';

// @ts-expect-error - required for the browser polyfill
chrome.runtime.id = 'chrome-extension-test';
Object.assign(global, { chrome, browser: chrome });
