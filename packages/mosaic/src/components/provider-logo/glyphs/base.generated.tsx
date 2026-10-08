import type { ProviderLogoGlyph } from '../provider-logo.types';

export const base: ProviderLogoGlyph = {
  id: 'base',
  viewBox: '0 0 1280 1280',
  render: () => (
    <path
      style={{ fill: 'light-dark(#0000FF, #fff)' }}
      d='M0 101.1c0-34.6 0-52 6.5-65.3A64 64 0 0 1 36 6.5C49.2 0 66.5 0 101 0h1078c34.6 0 52 0 65.3 6.5a64 64 0 0 1 29.3 29.4c6.5 13.3 6.5 30.6 6.5 65.2V1179c0 34.6 0 52-6.5 65.3a64 64 0 0 1-29.3 29.3c-13.4 6.5-30.7 6.5-65.3 6.5H101c-34.6 0-52 0-65.3-6.5a64 64 0 0 1-29.3-29.3C0 1230.8 0 1213.5 0 1178.9z'
    />
  ),
};
