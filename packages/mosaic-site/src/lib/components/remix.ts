export type RemixId = 'default' | 'canvas' | 'tabs';
export const REMIX_MESSAGE = 'mosaic-remix';
export const REMIXES_BY_SLUG: Record<string, { id: RemixId; label: string }[]> = {
  'user-profile': [
    { id: 'default', label: 'bundled' },
    { id: 'canvas', label: 'canvas' },
    { id: 'tabs', label: 'top nav' },
  ],
};
export const parseRemix = (value: string | null | undefined): RemixId =>
  value === 'canvas' || value === 'tabs' ? value : 'default';
