'use client';
import * as React from 'react';

import { useMode } from '@/components/use-mode';
import { PALETTE, type TilePalette } from '@/lib/brand/tile-palettes';
import { TILE_DEFAULTS, type TileSettings } from '@/lib/tile-settings';

export function useTileTune(): TileSettings {
  const settings = TILE_DEFAULTS;
  const dark = useMode() === 'dark';
  return React.useMemo(
    () =>
      dark
        ? {
            ...settings,
            grout: settings.darkGrout,
            gloss: settings.darkGloss,
            shadeBase: settings.darkShade,
            bevelHighlight: settings.darkBevelHighlight,
            bevelShadow: settings.darkBevelShadow,
            mottle: settings.darkMottle,
            bloom: settings.darkBloom,
            specks: settings.darkSpecks,
            craze: settings.darkCraze,
          }
        : settings,
    [dark, settings],
  );
}

export function usePalette(): TilePalette {
  const settings = TILE_DEFAULTS;
  const dark = useMode() === 'dark';
  return React.useMemo(
    () =>
      dark
        ? {
            ...PALETTE,
            paper: settings.darkPaper,
            brand: settings.darkBrand,
            soft: settings.darkSoft,
            deep: settings.darkDeep,
            ring: settings.darkRing,
            grout: settings.darkGrout,
          }
        : PALETTE,
    [dark, settings],
  );
}
