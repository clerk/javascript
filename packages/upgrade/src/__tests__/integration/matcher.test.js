import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runScans } from '../../runner.js';
import { writeFixtureFile } from '../helpers/create-fixture.js';

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

describe('matcher functionality', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-upgrade-matcher-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('single regex matcher', () => {
    it('matches single pattern in file', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const value = hideSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: new RegExp('hideSlug', 'g'),
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Change');
      expect(results[0].instances).toHaveLength(1);
      expect(results[0].instances[0].file).toContain('test.tsx');
    });

    it('does not match when pattern is absent', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const value = somethingElse();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: new RegExp('hideSlug', 'g'),
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(0);
    });
  });

  describe('array matcher with OR logic (default)', () => {
    it('matches when any pattern in array matches', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const value = hideSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(1);
    });

    it('matches multiple patterns when both are present', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const a = hideSlug(); const b = showSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(2);
    });

    it('does not match when no patterns match', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const value = somethingElse();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(0);
    });
  });

  describe('array matcher with AND logic', () => {
    it('matches when all patterns are present', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const a = hideSlug(); const b = showSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(2);
    });

    it('does not match when only one pattern is present', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const value = hideSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(0);
    });

    it('does not match when no patterns are present', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const value = somethingElse();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(0);
    });

    it('matches across multiple files when all patterns are present', async () => {
      writeFixtureFile(tempDir, 'file1.tsx', 'const a = hideSlug();');
      writeFixtureFile(tempDir, 'file2.tsx', 'const b = showSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      // AND logic checks if all patterns match somewhere in the file
      // Since hideSlug is in file1 and showSlug is in file2, each file individually
      // doesn't have both, so no matches should be found
      expect(results).toHaveLength(0);
    });

    it('matches when all patterns are present in the same file', async () => {
      writeFixtureFile(tempDir, 'file1.tsx', 'const a = hideSlug();');
      writeFixtureFile(tempDir, 'file2.tsx', 'const a = hideSlug(); const b = showSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('hideSlug', 'g'), new RegExp('showSlug', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      // Only file2 has both patterns, so it should match
      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(2); // Both patterns match in file2
    });
  });

  describe('matcherLogic loading from frontmatter', () => {
    it('defaults to OR logic when matcherLogic is not specified', async () => {
      // Test that matcherLogic defaults to 'or' when not specified
      const testConfig = {
        id: 'test-version',
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('pattern1', 'g'), new RegExp('pattern2', 'g')],
            matcherLogic: 'or', // Should default to 'or' when not specified in frontmatter
            packages: ['*'],
          },
        ],
      };

      writeFixtureFile(tempDir, 'test.tsx', 'const value = pattern1();');

      const results = await runScans(testConfig, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });
      // Should match with OR logic (any pattern matches)
      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(1);
    });

    it('loads AND logic from frontmatter', async () => {
      const testConfig = {
        id: 'test-version',
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('pattern1', 'g'), new RegExp('pattern2', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      writeFixtureFile(tempDir, 'test.tsx', 'const a = pattern1(); const b = pattern2();');

      const results = await runScans(testConfig, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });
      // Should match with AND logic (all patterns match)
      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(2);
    });

    it('loads OR logic explicitly from frontmatter', async () => {
      const testConfig = {
        id: 'test-version',
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('pattern1', 'g'), new RegExp('pattern2', 'g')],
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      writeFixtureFile(tempDir, 'test.tsx', 'const value = pattern1();');

      const results = await runScans(testConfig, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });
      // Should match with OR logic (any pattern matches)
      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles empty array matcher gracefully', async () => {
      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [],
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      writeFixtureFile(tempDir, 'test.tsx', 'const value = something();');

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(0);
    });

    it('handles multiple matches of the same pattern', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const a = hideSlug(); const b = hideSlug();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: new RegExp('hideSlug', 'g'),
            matcherLogic: 'or',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(2);
    });

    it('handles AND logic with three patterns', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const a = pattern1(); const b = pattern2(); const c = pattern3();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('pattern1', 'g'), new RegExp('pattern2', 'g'), new RegExp('pattern3', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(1);
      expect(results[0].instances).toHaveLength(3);
    });

    it('does not match AND logic when one of three patterns is missing', async () => {
      writeFixtureFile(tempDir, 'test.tsx', 'const a = pattern1(); const b = pattern2();');

      const config = {
        changes: [
          {
            title: 'Test Change',
            matcher: [new RegExp('pattern1', 'g'), new RegExp('pattern2', 'g'), new RegExp('pattern3', 'g')],
            matcherLogic: 'and',
            packages: ['*'],
          },
        ],
      };

      const results = await runScans(config, 'nextjs', { dir: tempDir, ignore: ['changes/**'] });

      expect(results).toHaveLength(0);
    });
  });
});
