import { CELL_TRAIL_DEFAULTS, type CellTrailSettings } from './cell-trail';
export const LIGHT_HERO_CELL_TRAIL: CellTrailSettings = {
  ...CELL_TRAIL_DEFAULTS,
  theme: 'light',
  cellSize: 64,
  gap: 0,
  trail: 1.1,
  spread: 0.9,
  fillMode: 'solid',
  pop: false,
  dashedGrid: false,
  autoplay: false,
  intensity: 0.07,
  gridAlpha: 0.07,
};
export type SubtleTheme = 'light' | 'dark';
export type SubtleShared = {
  tiles: number;
  size: number;
  grout: number;
  round: number;
  jitter: number;
  variation: number;
  lift: number;
};
export type SubtleLighting = {
  tintLevel: number;
  secondaryTone: number;
  ambient: number;
  bevel: number;
  bump: number;
  facet: number;
  roughness: number;
  light: number;
  gridOpacity: number;
  page: number;
};
export type SubtleConfig = {
  shared: SubtleShared;
  light: SubtleLighting;
  dark: SubtleLighting;
};
export const SUBTLE_PRESETS: SubtleConfig = {
  shared: {
    tiles: 40,
    size: 0.85,
    grout: 0.14,
    round: 0.22,
    jitter: 0.5,
    variation: 0.3,
    lift: 0.16,
  },
  light: {
    tintLevel: 1.38,
    secondaryTone: 1,
    ambient: 0,
    bevel: 0.05,
    bump: 0,
    facet: 0.2,
    roughness: 0,
    light: 0.25,
    gridOpacity: 0.035,
    page: 1,
  },
  dark: {
    tintLevel: 1.5,
    secondaryTone: 0.85,
    ambient: 0.35,
    bevel: 0.23,
    bump: 0.42,
    facet: 0.02,
    roughness: 0.7,
    light: 0.3,
    gridOpacity: 0.03,
    page: 0.055,
  },
};
type Slider<K extends string> = {
  key: K;
  label: string;
  min: number;
  max: number;
  step: number;
};
export const SUBTLE_LIGHTING_SLIDERS: Slider<keyof SubtleLighting>[] = [
  { key: 'tintLevel', label: 'Tile brightness', min: 0.2, max: 1.5, step: 0.01 },
  { key: 'secondaryTone', label: 'Arc tone', min: 0.3, max: 1, step: 0.01 },
  { key: 'ambient', label: 'Ambient', min: 0, max: 1, step: 0.01 },
  { key: 'page', label: 'Page tone', min: 0, max: 1, step: 0.005 },
  { key: 'light', label: 'Light', min: 0.2, max: 2, step: 0.05 },
  { key: 'roughness', label: 'Roughness', min: 0, max: 1, step: 0.02 },
  { key: 'bevel', label: 'Bevel', min: 0.05, max: 1, step: 0.02 },
  { key: 'bump', label: 'Texture', min: 0, max: 1, step: 0.02 },
  { key: 'facet', label: 'Facets', min: 0, max: 1, step: 0.02 },
  { key: 'gridOpacity', label: 'Grid opacity', min: 0, max: 0.3, step: 0.005 },
];
export const SUBTLE_SHARED_SLIDERS: Slider<keyof SubtleShared>[] = [
  { key: 'tiles', label: 'Tiles across', min: 10, max: 70, step: 1 },
  { key: 'size', label: 'Size', min: 0.4, max: 1, step: 0.01 },
  { key: 'grout', label: 'Grout', min: 0.02, max: 0.4, step: 0.01 },
  { key: 'round', label: 'Corner radius', min: 0, max: 1, step: 0.02 },
  { key: 'jitter', label: 'Hand-laid', min: 0, max: 1, step: 0.02 },
  { key: 'variation', label: 'Tone variation', min: 0, max: 1, step: 0.02 },
  { key: 'lift', label: 'Hover lift', min: 0, max: 1, step: 0.02 },
];
