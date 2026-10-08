import type { ProviderLogoGlyph } from '../provider-logo.types';

export const apple: ProviderLogoGlyph = {
  id: 'apple',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        style={{ fill: 'light-dark(#000, #fff)' }}
        d='M17.8 6.8c-.2.1-2.2 1.3-2.2 3.8 0 3 2.6 4 2.7 4 0 .1-.4 1.5-1.4 3-.8 1.1-1.7 2.4-3.1 2.4s-1.7-.8-3.3-.8-2 .8-3.3.8-2.1-1.1-3.1-2.5A12 12 0 0 1 2 10.8c0-3.9 2.5-6 5-6 1.3 0 2.4 1 3.3 1s2-1 3.5-1c.6 0 2.6 0 4 2M13 3.2Q14 2 14 .4V0q-1.7.1-3 1.5-.9 1.1-1 2.7v.4h.3q1.5-.1 2.7-1.4'
      />
    </g>
  ),
};
