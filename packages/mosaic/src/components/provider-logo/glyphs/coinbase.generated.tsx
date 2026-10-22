import type { ProviderLogoGlyph } from '../provider-logo.types';

export const coinbase: ProviderLogoGlyph = {
  id: 'coinbase',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        fill='#0052FF'
        d='M10 15a5 5 0 1 1 5-5.8h5a10 10 0 1 0 0 1.6h-5a5 5 0 0 1-5 4.2'
      />
    </g>
  ),
};
