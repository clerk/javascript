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
    // Filter to only changes with matchers for this test
    config.changes = config.changes.filter(change => change.matcher);

    const options = {
      dir: fixture.path,
      ignore: ['**/src/**'],
    };

    const results = await runScans(config, 'nextjs', options);

    expect(results).toEqual([]);
  });

  it('always includes changes without matchers', async () => {
    const config = await loadConfig('nextjs', 6);
    // Add a change without a matcher
    config.changes = [
      {
        title: 'Test change without matcher',
        matcher: null,
        packages: ['*'],
        category: 'breaking',
        warning: false,
        docsAnchor: 'test-change',
        content: 'This is a test change',
      },
    ];

    const options = {
      dir: fixture.path,
      ignore: [],
    };

    const results = await runScans(config, 'nextjs', options);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test change without matcher');
    expect(results[0].instances).toEqual([]);
  });

  it('includes both changes with and without matchers', async () => {
    const config = await loadConfig('nextjs', 6);
    // Add a change without a matcher and one with a matcher
    config.changes = [
      {
        title: 'Change without matcher',
        matcher: null,
        packages: ['*'],
        category: 'breaking',
        warning: false,
        docsAnchor: 'change-without-matcher',
        content: 'This change has no matcher',
      },
      {
        title: 'Change with matcher',
        matcher: new RegExp('clerkMiddleware', 'g'),
        packages: ['*'],
        category: 'breaking',
        warning: false,
        docsAnchor: 'change-with-matcher',
        content: 'This change has a matcher',
      },
    ];

    const options = {
      dir: fixture.path,
      ignore: [],
    };

    const results = await runScans(config, 'nextjs', options);

    // Should include both changes
    expect(results.length).toBeGreaterThanOrEqual(1);
    const changeWithoutMatcher = results.find(r => r.title === 'Change without matcher');
    expect(changeWithoutMatcher).toBeDefined();
    expect(changeWithoutMatcher.instances).toEqual([]);
  });
});
