export type FrameConfig = {
  slug: string;
  url: string;
  zoom: number;
  radius: number;
  mode: 'flush' | 'modal' | 'fullscreen';
};
export const DEFAULT_FRAME: FrameConfig = {
  slug: 'user-profile',
  url: 'app.acme.com/account',
  zoom: 1,
  radius: 16,
  mode: 'flush',
};
export const FRAME_SLIDERS: {
  key: Exclude<keyof FrameConfig, 'slug' | 'url' | 'mode'>;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: 'zoom', label: 'Zoom', min: 0.5, max: 1.6, step: 0.02 },
  { key: 'radius', label: 'Corner radius', min: 0, max: 32, step: 1 },
];
export const frameUrlFor = (slug: string) =>
  slug === 'organization-profile' ? 'app.acme.com/organization' : 'app.acme.com/account';
