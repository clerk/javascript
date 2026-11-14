export type OgVariantId = 'og' | 'video' | 'square';

export type OgVariant = { id: OgVariantId; label: string; platforms: string; width: number; height: number };

export const OG_VARIANTS: OgVariant[] = [
  {
    id: 'og',
    label: 'Link preview',
    platforms: 'X, LinkedIn, Facebook, Slack, Discord, iMessage',
    width: 1200,
    height: 630,
  },
  { id: 'video', label: 'Video', platforms: 'og:video, X video cards', width: 1280, height: 720 },
  {
    id: 'square',
    label: 'Square',
    platforms: 'WhatsApp and small iMessage or Slack thumbnails',
    width: 630,
    height: 630,
  },
];

export type OgOptions = {
  caption: string;
  loopSeconds: number;
  swaySteps: number;
  swayGain: number;
  ripple: number;
  beta: boolean;
};

export const OG_DEFAULTS: OgOptions = {
  caption: '',
  loopSeconds: 12,
  swaySteps: 3,
  swayGain: 1.5,
  ripple: 1,
  beta: true,
};
