import { __resetClerkQueryClientForTest } from '@clerk/shared/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, expect } from 'vitest';

import { startWorker, takeUnhandledRequests, takeUnsettledHolds, worker } from './src/__tests__/feature/fake-fapi';

expect.extend(matchers);

beforeAll(async () => {
  await startWorker();
});

beforeEach(() => {
  window.focus();
});

afterEach(() => {
  cleanup();
  __resetClerkQueryClientForTest();
  worker.resetHandlers();
  expect(takeUnhandledRequests(), 'Frontend API requests without a handler').toEqual([]);
  expect(takeUnsettledHolds(), 'Held Frontend API requests never released or failed').toEqual([]);
});

afterAll(() => {
  worker.stop();
});
