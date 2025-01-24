import type { ParsedElements, PartialTheme } from '~/contexts/AppearanceContext';
import { DESCRIPTORS } from '~/descriptors';

/**
 * Given an object containing partial descriptors, returns a full ParsedElements object with generated descriptors.
 */
export function buildTheme(p: PartialTheme): ParsedElements {
  const theme: Partial<ParsedElements> = {};

  // Setup base theme containing empty objects for each descriptor.
  DESCRIPTORS.forEach(descriptor => {
    theme[descriptor] = {
      descriptor: `cl-${descriptor}`,
      className: '',
      style: {},
    };
  });

  for (const descriptor in p) {
    const key = descriptor;

    if (p[key]) {
      if (!(key in theme)) {
        console.warn(`Clerk: Unknown descriptor: ${descriptor}`);
        continue;
      }

      // These non-null assertions are okay since we confirmed that theme contains the descriptor above.
      const { className, style } = p[key];
      if (className) {
        theme[key]!.className = className;
      }

      if (style) {
        theme[key]!.style = style;
      }
    }
  }

  return theme as ParsedElements;
}

/**
 * Given two complete theme objects, merge their className and style properties to create a new merged theme.
 */
export function mergeTheme(a: ParsedElements, b: ParsedElements): ParsedElements {
  const mergedTheme = { ...a };

  for (const d in mergedTheme) {
    const descriptor = d;
    mergedTheme[descriptor].className = [mergedTheme[descriptor].className, b[descriptor].className].join(' ');
    mergedTheme[descriptor].style = { ...mergedTheme[descriptor].style, ...b[descriptor].style };
  }

  return mergedTheme;
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('buildTheme', () => {
    it('returns a theme containing all descriptors', () => {
      const theme = buildTheme({});
      expect(Object.keys(theme).sort()).toStrictEqual([...DESCRIPTORS].sort());

      for (const [k, v] of Object.entries(theme)) {
        expect(v.descriptor).toEqual(`cl-${k}`);
        expect(v.className).toEqual('');
        expect(v.style).toStrictEqual({});
      }
    });
  });
}
