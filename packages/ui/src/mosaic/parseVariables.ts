import type { MosaicTheme, MosaicVariables } from './tokens';

export function parseVariables(defaults: MosaicTheme, variables?: MosaicVariables): MosaicTheme {
  if (!variables) return defaults;
  // Stub: returns defaults until the token spec defines derived value computation
  // (e.g. colorPrimary → primaryHover/primaryActive/primaryMuted/primaryContrast)
  return defaults;
}
