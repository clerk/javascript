import { describe, expect, it } from 'vitest';

import { parseRangeToBounds, type VersionBounds } from '../parseVersionRange';

describe('parseRangeToBounds', () => {
  describe('caret ranges', () => {
    it('parses simple caret range', () => {
      expect(parseRangeToBounds('^18.0.0')).toEqual<VersionBounds[]>([[18, 0, -1, 0]]);
    });

    it('parses caret range with non-zero minor', () => {
      expect(parseRangeToBounds('^18.2.0')).toEqual<VersionBounds[]>([[18, 2, -1, 0]]);
    });

    it('parses caret range with non-zero patch', () => {
      expect(parseRangeToBounds('^18.2.5')).toEqual<VersionBounds[]>([[18, 2, -1, 5]]);
    });
  });

  describe('tilde ranges', () => {
    it('parses simple tilde range', () => {
      expect(parseRangeToBounds('~19.0.0')).toEqual<VersionBounds[]>([[19, 0, 0, 0]]);
    });

    it('parses tilde range with non-zero minor', () => {
      expect(parseRangeToBounds('~19.1.0')).toEqual<VersionBounds[]>([[19, 1, 1, 0]]);
    });

    it('parses tilde range with non-zero patch', () => {
      expect(parseRangeToBounds('~19.0.3')).toEqual<VersionBounds[]>([[19, 0, 0, 3]]);
    });
  });

  describe('exact versions', () => {
    it('treats exact version as caret range', () => {
      expect(parseRangeToBounds('18.3.1')).toEqual<VersionBounds[]>([[18, 3, -1, 1]]);
    });
  });

  describe('OR combinations', () => {
    it('parses two caret ranges', () => {
      expect(parseRangeToBounds('^18.0.0 || ^19.0.0')).toEqual<VersionBounds[]>([
        [18, 0, -1, 0],
        [19, 0, -1, 0],
      ]);
    });

    it('parses mixed caret and tilde ranges', () => {
      expect(parseRangeToBounds('^18.0.0 || ~19.0.3')).toEqual<VersionBounds[]>([
        [18, 0, -1, 0],
        [19, 0, 0, 3],
      ]);
    });

    it('parses multiple tilde ranges', () => {
      expect(parseRangeToBounds('~19.0.3 || ~19.1.4 || ~19.2.3')).toEqual<VersionBounds[]>([
        [19, 0, 0, 3],
        [19, 1, 1, 4],
        [19, 2, 2, 3],
      ]);
    });

    it('parses complex real-world range', () => {
      // This is the actual range from pnpm-workspace.yaml
      expect(parseRangeToBounds('^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0')).toEqual<VersionBounds[]>([
        [18, 0, -1, 0],
        [19, 0, 0, 3],
        [19, 1, 1, 4],
        [19, 2, 2, 3],
        [19, 3, 3, 0],
      ]);
    });
  });

  describe('edge cases', () => {
    it('handles extra whitespace', () => {
      expect(parseRangeToBounds('  ^18.0.0   ||   ^19.0.0  ')).toEqual<VersionBounds[]>([
        [18, 0, -1, 0],
        [19, 0, -1, 0],
      ]);
    });

    it('returns empty array for invalid input', () => {
      expect(parseRangeToBounds('invalid')).toEqual<VersionBounds[]>([]);
      expect(parseRangeToBounds('')).toEqual<VersionBounds[]>([]);
    });

    it('skips invalid parts in OR combinations', () => {
      expect(parseRangeToBounds('^18.0.0 || invalid || ^19.0.0')).toEqual<VersionBounds[]>([
        [18, 0, -1, 0],
        [19, 0, -1, 0],
      ]);
    });

    it('handles prerelease versions', () => {
      // semver.coerce strips prerelease info
      expect(parseRangeToBounds('~19.3.0-0')).toEqual<VersionBounds[]>([[19, 3, 3, 0]]);
      expect(parseRangeToBounds('^19.0.0-rc.1')).toEqual<VersionBounds[]>([[19, 0, -1, 0]]);
    });
  });
});
