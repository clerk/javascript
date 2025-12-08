import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadConfig } from '../../config.js';
import { runScans } from '../../runner.js';
import { createTempFixture } from '../helpers/create-fixture.js';

vi.mock('../../render.js', () => ({
  colors: { reset: '', bold: '', yellow: '', gray: '' },
  createSpinner: vi.fn(() => ({
    update: vi.fn(),
    stop: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  })),
  promptText: vi.fn((msg, defaultValue) => defaultValue),
  renderCodemodResults: vi.fn(),
  renderText: vi.fn(),
}));

describe('runScans', () => {
  let fixture;

  beforeEach(() => {
    fixture = createTempFixture('nextjs-v6');
  });

  afterEach(() => {
    fixture?.cleanup();
  });

  it('finds patterns in fixture files', async () => {
    const config = await loadConfig('nextjs', 6);
    const options = {
      dir: fixture.path,
      ignore: [],
    };

    const results = await runScans(config, 'nextjs', options);

    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty array when no matchers match', async () => {
    const config = await loadConfig('nextjs', 6);
    config.changes = [];

    const options = {
      dir: fixture.path,
      ignore: [],
    };

    const results = await runScans(config, 'nextjs', options);

    expect(results).toEqual([]);
  });

  it('respects ignore patterns', async () => {
    const config = await loadConfig('nextjs', 6);
    const options = {
      dir: fixture.path,
      ignore: ['**/src/**'],
    };

    const results = await runScans(config, 'nextjs', options);

    expect(results).toEqual([]);
  });
});
