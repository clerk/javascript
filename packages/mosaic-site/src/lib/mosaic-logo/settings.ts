export type MosaicEffect = 'reveal' | 'shatter' | 'explode' | 'ripple' | 'shuffle';
export type MosaicPalette = 'logo' | 'mono' | 'stone' | 'accent';
export type MosaicSettings = {
  effect: MosaicEffect;
  radius: number;
  tileSize: number;
  gap: number;
  depth: number;
  strength: number;
  speed: number;
  tilt: number;
  float: boolean;
  palette: MosaicPalette;
  autoplay: boolean;
};
export const DEFAULT_MOSAIC_SETTINGS: MosaicSettings = {
  effect: 'shatter',
  radius: 6,
  tileSize: 0.9,
  gap: 0.14,
  depth: 1.6,
  strength: 1,
  speed: 1,
  tilt: 10,
  float: true,
  palette: 'logo',
  autoplay: false,
};
export const MOSAIC_EFFECTS: {
  id: MosaicEffect;
  label: string;
  description: string;
  preset: Partial<MosaicSettings>;
}[] = [
  {
    id: 'reveal',
    label: 'Reveal',
    description: 'The solid logo is clipped under the cursor and the mosaic it was built from shows through.',
    preset: { radius: 6, strength: 1, tileSize: 0.9 },
  },
  {
    id: 'shatter',
    label: 'Shatter',
    description: 'Tiles break off the logo under the cursor and fly outward, then settle back.',
    preset: { radius: 6, strength: 1, tileSize: 0.9 },
  },
  {
    id: 'explode',
    label: 'Explode',
    description: 'Hover anywhere and the whole logo bursts into tiles that drift in 3D, then reassemble.',
    preset: { radius: 9, strength: 1, tileSize: 0.9 },
  },
  {
    id: 'ripple',
    label: 'Ripple',
    description: 'Tiles flip over in a travelling wave around the cursor, turning the logo into a mosaic.',
    preset: { radius: 7, strength: 1, tileSize: 0.9 },
  },
  {
    id: 'shuffle',
    label: 'Shuffle',
    description: 'Tiles under the cursor slide to neighbouring cells, rearranging the logo into something new.',
    preset: { radius: 6.5, strength: 1, tileSize: 0.9 },
  },
];
export const MOSAIC_PALETTES: {
  id: MosaicPalette;
  label: string;
}[] = [
  { id: 'logo', label: 'Logo' },
  { id: 'mono', label: 'Mono' },
  { id: 'stone', label: 'Stone' },
  { id: 'accent', label: 'Violet accents' },
];
export const MOSAIC_RANGES = {
  radius: { min: 2, max: 12, step: 0.1 },
  tileSize: { min: 0.45, max: 1.8, step: 0.05 },
  gap: { min: 0, max: 0.4, step: 0.01 },
  depth: { min: 0.3, max: 4, step: 0.1 },
  strength: { min: 0.2, max: 2.5, step: 0.05 },
  speed: { min: 0.3, max: 3, step: 0.05 },
  tilt: { min: 0, max: 25, step: 1 },
} as const;
