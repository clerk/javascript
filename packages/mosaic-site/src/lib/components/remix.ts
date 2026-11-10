export type RemixId = 'default' | 'canvas' | 'tabs';
export const REMIX_MESSAGE = 'mosaic-remix';
export const REMIXES_BY_SLUG: Record<string, { id: RemixId; label: string }[]> = {};
export const parseRemix = (value: string | null | undefined): RemixId =>
  value === 'canvas' || value === 'tabs' ? value : 'default';
