import { describe, expect, it } from 'vitest';

import {
  checkVersionAgainstBounds,
  isVersionAtLeast,
  isVersionCompatible,
  parseVersion,
  type VersionBounds,
} from '../versionCheck';

describe('parseVersion', () => {
  it('parses standard semver versions', () => {
    expect(parseVersion('18.3.1')).toEqual({ major: 18, minor: 3, patch: 1 });
    expect(parseVersion('19.0.0')).toEqual({ major: 19, minor: 0, patch: 0 });
    expect(parseVersion('0.0.1')).toEqual({ major: 0, minor: 0, patch: 1 });
  });

  it('parses versions with pre-release suffixes', () => {
    expect(parseVersion('19.0.0-rc.1')).toEqual({ major: 19, minor: 0, patch: 0 });
    expect(parseVersion('18.3.0-alpha.1')).toEqual({ major: 18, minor: 3, patch: 0 });
    expect(parseVersion('19.0.0-beta.2+build.123')).toEqual({ major: 19, minor: 0, patch: 0 });
  });

  it('returns null for invalid versions', () => {
    expect(parseVersion('')).toBeNull();
    expect(parseVersion('invalid')).toBeNull();
    expect(parseVersion('18')).toBeNull();
    expect(parseVersion('18.3')).toBeNull();
    expect(parseVersion('v18.3.1')).toBeNull();
    expect(parseVersion('18.3.x')).toBeNull();
  });
});

describe('checkVersionAgainstBounds', () => {
  describe('caret ranges (maxMinor === -1)', () => {
    // ^18.0.0 means >= 18.0.0 and < 19.0.0
    const caretBounds: VersionBounds[] = [[18, 0, -1, 0]];

    it('matches versions at the minimum', () => {
      expect(checkVersionAgainstBounds({ major: 18, minor: 0, patch: 0 }, caretBounds)).toBe(true);
    });

    it('matches versions with higher minor', () => {
      expect(checkVersionAgainstBounds({ major: 18, minor: 1, patch: 0 }, caretBounds)).toBe(true);
      expect(checkVersionAgainstBounds({ major: 18, minor: 99, patch: 99 }, caretBounds)).toBe(true);
    });

    it('matches versions with higher patch on same minor', () => {
      expect(checkVersionAgainstBounds({ major: 18, minor: 0, patch: 1 }, caretBounds)).toBe(true);
      expect(checkVersionAgainstBounds({ major: 18, minor: 0, patch: 99 }, caretBounds)).toBe(true);
    });

    it('does not match versions with lower major', () => {
      expect(checkVersionAgainstBounds({ major: 17, minor: 99, patch: 99 }, caretBounds)).toBe(false);
    });

    it('does not match versions with higher major', () => {
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 0 }, caretBounds)).toBe(false);
    });

    it('does not match versions below the minimum patch', () => {
      // ^18.2.5 means >= 18.2.5
      const boundsWithPatch: VersionBounds[] = [[18, 2, -1, 5]];
      expect(checkVersionAgainstBounds({ major: 18, minor: 2, patch: 4 }, boundsWithPatch)).toBe(false);
      expect(checkVersionAgainstBounds({ major: 18, minor: 2, patch: 5 }, boundsWithPatch)).toBe(true);
      expect(checkVersionAgainstBounds({ major: 18, minor: 2, patch: 6 }, boundsWithPatch)).toBe(true);
      // Higher minor still works
      expect(checkVersionAgainstBounds({ major: 18, minor: 3, patch: 0 }, boundsWithPatch)).toBe(true);
    });
  });

  describe('tilde ranges (maxMinor === minMinor)', () => {
    // ~19.0.0 means >= 19.0.0 and < 19.1.0
    const tildeBounds: VersionBounds[] = [[19, 0, 0, 0]];

    it('matches versions at the minimum', () => {
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 0 }, tildeBounds)).toBe(true);
    });

    it('matches versions with higher patch on same minor', () => {
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 1 }, tildeBounds)).toBe(true);
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 99 }, tildeBounds)).toBe(true);
    });

    it('does not match versions with different minor', () => {
      expect(checkVersionAgainstBounds({ major: 19, minor: 1, patch: 0 }, tildeBounds)).toBe(false);
      expect(checkVersionAgainstBounds({ major: 19, minor: 2, patch: 0 }, tildeBounds)).toBe(false);
    });

    it('does not match versions with different major', () => {
      expect(checkVersionAgainstBounds({ major: 18, minor: 0, patch: 0 }, tildeBounds)).toBe(false);
      expect(checkVersionAgainstBounds({ major: 20, minor: 0, patch: 0 }, tildeBounds)).toBe(false);
    });

    it('does not match versions below the minimum patch', () => {
      // ~19.0.3 means >= 19.0.3 and < 19.1.0
      const boundsWithPatch: VersionBounds[] = [[19, 0, 0, 3]];
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 2 }, boundsWithPatch)).toBe(false);
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 3 }, boundsWithPatch)).toBe(true);
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 4 }, boundsWithPatch)).toBe(true);
    });
  });

  describe('multiple bounds', () => {
    // ^18.0.0 || ^19.0.0
    const multipleBounds: VersionBounds[] = [
      [18, 0, -1, 0],
      [19, 0, -1, 0],
    ];

    it('matches versions satisfying any bound', () => {
      expect(checkVersionAgainstBounds({ major: 18, minor: 3, patch: 1 }, multipleBounds)).toBe(true);
      expect(checkVersionAgainstBounds({ major: 19, minor: 0, patch: 0 }, multipleBounds)).toBe(true);
    });

    it('does not match versions outside all bounds', () => {
      expect(checkVersionAgainstBounds({ major: 17, minor: 0, patch: 0 }, multipleBounds)).toBe(false);
      expect(checkVersionAgainstBounds({ major: 20, minor: 0, patch: 0 }, multipleBounds)).toBe(false);
    });
  });

  describe('empty bounds', () => {
    it('returns false for empty bounds array', () => {
      expect(checkVersionAgainstBounds({ major: 18, minor: 0, patch: 0 }, [])).toBe(false);
    });
  });
});

describe('isVersionCompatible', () => {
  const bounds: VersionBounds[] = [
    [18, 0, -1, 0], // ^18.0.0
    [19, 0, -1, 0], // ^19.0.0
  ];

  it('returns true for compatible versions', () => {
    expect(isVersionCompatible('18.3.1', bounds)).toBe(true);
    expect(isVersionCompatible('19.0.0', bounds)).toBe(true);
    expect(isVersionCompatible('19.0.0-rc.1', bounds)).toBe(true);
  });

  it('returns false for incompatible versions', () => {
    expect(isVersionCompatible('17.0.0', bounds)).toBe(false);
    expect(isVersionCompatible('20.0.0', bounds)).toBe(false);
  });

  it('returns false for invalid version strings', () => {
    expect(isVersionCompatible('', bounds)).toBe(false);
    expect(isVersionCompatible('invalid', bounds)).toBe(false);
  });
});

describe('isVersionAtLeast', () => {
  describe('returns true when version meets or exceeds minimum', () => {
    it('exact match', () => {
      expect(isVersionAtLeast('5.100.0', '5.100.0')).toBe(true);
    });

    it('higher patch', () => {
      expect(isVersionAtLeast('5.100.1', '5.100.0')).toBe(true);
    });

    it('higher minor', () => {
      expect(isVersionAtLeast('5.101.0', '5.100.0')).toBe(true);
      expect(isVersionAtLeast('5.114.0', '5.100.0')).toBe(true);
    });

    it('higher major', () => {
      expect(isVersionAtLeast('6.0.0', '5.100.0')).toBe(true);
    });
  });

  describe('returns false when version is below minimum', () => {
    it('lower patch', () => {
      expect(isVersionAtLeast('5.100.0', '5.100.1')).toBe(false);
    });

    it('lower minor', () => {
      expect(isVersionAtLeast('5.99.0', '5.100.0')).toBe(false);
      expect(isVersionAtLeast('5.99.999', '5.100.0')).toBe(false);
    });

    it('lower major', () => {
      expect(isVersionAtLeast('4.999.999', '5.100.0')).toBe(false);
    });
  });

  describe('handles pre-release versions', () => {
    it('treats pre-release as base version', () => {
      expect(isVersionAtLeast('5.100.0-canary.123', '5.100.0')).toBe(true);
      expect(isVersionAtLeast('5.114.0-snapshot.456', '5.100.0')).toBe(true);
    });

    it('compares base versions ignoring pre-release suffix', () => {
      expect(isVersionAtLeast('5.99.0-canary.999', '5.100.0')).toBe(false);
    });
  });

  describe('handles edge cases', () => {
    it('returns false for null/undefined version', () => {
      expect(isVersionAtLeast(null, '5.100.0')).toBe(false);
      expect(isVersionAtLeast(undefined, '5.100.0')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isVersionAtLeast('', '5.100.0')).toBe(false);
    });

    it('returns false for invalid version string', () => {
      expect(isVersionAtLeast('invalid', '5.100.0')).toBe(false);
      expect(isVersionAtLeast('5.100', '5.100.0')).toBe(false);
    });

    it('returns false if minVersion cannot be parsed', () => {
      expect(isVersionAtLeast('5.100.0', 'invalid')).toBe(false);
    });
  });
});
