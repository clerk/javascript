import type { ProviderLogoGlyph } from '../provider-logo.types';

export const facebook: ProviderLogoGlyph = {
  id: 'facebook',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        fill='#0866FF'
        d='M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20'
      />
      <path
        fill='#fff'
        d='m13.9 12.9.4-2.9h-2.7V8.1q-.2-1.3 1.6-1.5h1.3V4l-2.3-.2q-3.6 0-3.8 3.9V10H6v2.9h2.5v7a10 10 0 0 0 3.2 0v-7z'
      />
    </g>
  ),
};
