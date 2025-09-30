import { vi } from 'vitest';
// `jest-chrome` directly references the `jest` global
(globalThis as any).jest = vi;

import { chrome } from 'jest-chrome';

// @ts-expect-error - required for the browser polyfill
chrome.runtime.id = 'chrome-extension-test';
Object.assign(global, { chrome, browser: chrome });
