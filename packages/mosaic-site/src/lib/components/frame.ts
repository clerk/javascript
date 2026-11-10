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
  zoom: 1.08,
  radius: 16,
  mode: 'flush',
};
export const frameUrlFor = (slug: string) =>
  slug === 'organization-profile' ? 'app.acme.com/organization' : 'app.acme.com/account';
