import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadConfig } from '../../config.js';
import { runCodemods, runScans } from '../../runner.js';
import { createTempFixture } from '../helpers/create-fixture.js';

const mockRunCodemod = vi.fn(() => Promise.resolve({ stats: {} }));

vi.mock('../../codemods/index.js', () => ({
  runCodemod: (...args) => mockRunCodemod(...args),
  getCodemodConfig: vi.fn(() => null),
}));

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

describe('runCodemods', () => {
  beforeEach(() => {
    mockRunCodemod.mockClear();
  });

  it('runs all codemods when no packages filter is specified', async () => {
    const config = {
      codemods: ['transform-a', 'transform-b'],
    };

    await runCodemods(config, 'nextjs', { glob: '**/*.tsx' });

    expect(mockRunCodemod).toHaveBeenCalledTimes(2);
    expect(mockRunCodemod).toHaveBeenCalledWith('transform-a', ['**/*.tsx'], { glob: '**/*.tsx' });
    expect(mockRunCodemod).toHaveBeenCalledWith('transform-b', ['**/*.tsx'], { glob: '**/*.tsx' });
  });

  it('skips codemods that do not match the current SDK', async () => {
    const config = {
      codemods: [
        'transform-all', // runs for all
        { name: 'transform-nextjs-only', packages: ['nextjs'] },
        { name: 'transform-react-only', packages: ['react'] },
      ],
    };

    await runCodemods(config, 'nextjs', { glob: '**/*.tsx' });

    expect(mockRunCodemod).toHaveBeenCalledTimes(2);
    expect(mockRunCodemod).toHaveBeenCalledWith('transform-all', ['**/*.tsx'], { glob: '**/*.tsx' });
    expect(mockRunCodemod).toHaveBeenCalledWith('transform-nextjs-only', ['**/*.tsx'], { glob: '**/*.tsx' });
  });

  it('runs codemods with wildcard packages for any SDK', async () => {
    const config = {
      codemods: [{ name: 'transform-universal', packages: ['*'] }],
    };

    await runCodemods(config, 'expo', { glob: '**/*.tsx' });

    expect(mockRunCodemod).toHaveBeenCalledTimes(1);
    expect(mockRunCodemod).toHaveBeenCalledWith('transform-universal', ['**/*.tsx'], { glob: '**/*.tsx' });
  });

  it('runs codemods when SDK is in the packages array', async () => {
    const config = {
      codemods: [{ name: 'transform-multi', packages: ['nextjs', 'react', 'expo'] }],
    };

    await runCodemods(config, 'react', { glob: '**/*.tsx' });

    expect(mockRunCodemod).toHaveBeenCalledTimes(1);
  });

  it('skips all codemods when SDK does not match any', async () => {
    const config = {
      codemods: [
        { name: 'transform-nextjs-only', packages: ['nextjs'] },
        { name: 'transform-react-only', packages: ['react'] },
      ],
    };

    await runCodemods(config, 'expo', { glob: '**/*.tsx' });

    expect(mockRunCodemod).not.toHaveBeenCalled();
  });

  it('handles empty codemods array', async () => {
    const config = {
      codemods: [],
    };

    await runCodemods(config, 'nextjs', { glob: '**/*.tsx' });

    expect(mockRunCodemod).not.toHaveBeenCalled();
  });

  it('handles undefined codemods', async () => {
    const config = {};

    await runCodemods(config, 'nextjs', { glob: '**/*.tsx' });

    expect(mockRunCodemod).not.toHaveBeenCalled();
  });

  it('treats empty packages array as matching no SDKs', async () => {
    const config = {
      codemods: [{ name: 'transform-none', packages: [] }],
    };

    await runCodemods(config, 'nextjs', { glob: '**/*.tsx' });

    expect(mockRunCodemod).not.toHaveBeenCalled();
  });

  it('treats undefined packages as matching all SDKs', async () => {
    const config = {
      codemods: [{ name: 'transform-all', packages: undefined }],
    };

    await runCodemods(config, 'expo', { glob: '**/*.tsx' });

    expect(mockRunCodemod).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from codemod execution', async () => {
    mockRunCodemod.mockRejectedValueOnce(new Error('Codemod failed'));

    const config = {
      codemods: ['transform-broken'],
    };

    await expect(runCodemods(config, 'nextjs', { glob: '**/*.tsx' })).rejects.toThrow('Codemod failed');
  });
});

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
    expect(results.some(result => result.title === 'Upgrade Node.js to v20.9.0 or higher')).toBe(true);
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
      ignore: ['**/src/**', '**/package.json'],
    };

    const results = await runScans(config, 'nextjs', options);

    expect(results).toEqual([]);
  });
});
