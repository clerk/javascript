import type { PartialTheme, ParsedElements } from '~/contexts/AppearanceContext';

/**
 * Given a complete theme object minus descriptors, returns a full ParsedElements object with generated descriptors.
 */
export function buildTheme(p: Partial<PartialTheme>): ParsedElements {
  const theme: Partial<ParsedElements> = {};

  for (const descriptor in p) {
    if (p[descriptor as keyof PartialTheme]) {
      const { className, style } = p[descriptor as keyof PartialTheme]!;
      theme[descriptor as keyof ParsedElements] = {
        descriptor: `cl-${descriptor}`,
        className: className ?? 'debug',
        style: style ?? {},
      };
    }
  }

  return theme as ParsedElements;
}
