import type { PartialTheme, ParsedElements } from '~/contexts/AppearanceContext';

/**
 * Given a complete theme object minus descriptors, returns a full ParsedElements object with generated descriptors.
 */
export function buildTheme(p: PartialTheme): ParsedElements {
  const theme: Partial<ParsedElements> = {};

  for (const descriptor in p) {
    if (p[descriptor as keyof PartialTheme]) {
      const { className, style } = p[descriptor as keyof PartialTheme]!;
      theme[descriptor as keyof ParsedElements] = {
        descriptor: `cl-${descriptor}`,
        className: className ?? '',
        style: style ?? {},
      };
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
    const descriptor = d as keyof ParsedElements;
    mergedTheme[descriptor].className = [mergedTheme[descriptor].className, b[descriptor].className].join(' ');
    mergedTheme[descriptor].style = { ...mergedTheme[descriptor].style, ...b[descriptor].style };
  }

  return mergedTheme;
}
