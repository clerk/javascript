import { DEFAULT_MOSAIC_SETTINGS, type MosaicSettings } from './settings';
export const HERO_MOSAIC_SETTINGS: MosaicSettings = {
  ...DEFAULT_MOSAIC_SETTINGS,
  effect: 'shatter',
  radius: 6,
  autoplay: true,
};
