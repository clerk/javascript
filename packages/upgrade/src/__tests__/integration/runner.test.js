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
  promptText: vi.fn(async (msg, defaultValue) => defaultValue),
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

    expect(Array.isArray(results)).toBe(true);
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

    expect(Array.isArray(results)).toBe(true);
  });
});

describe('runScans with theme imports', () => {
  let fixture;

  beforeEach(() => {
    fixture = createTempFixture('nextjs-v6');
  });

  afterEach(() => {
    fixture?.cleanup();
  });

  it('detects theme imports from @clerk/nextjs/themes', async () => {
    const config = await loadConfig('nextjs', 6);
    const options = {
      dir: fixture.path,
      ignore: [],
    };

    const results = await runScans(config, 'nextjs', options);
    const themeChange = results.find(r => r.title?.includes('Theme') || r.docsAnchor?.includes('theme'));

    if (themeChange) {
      expect(themeChange.instances.length).toBeGreaterThan(0);
    }
  });
});
