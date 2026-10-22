import type { ProviderLogoGlyph } from '../provider-logo.types';

export const dropbox: ProviderLogoGlyph = {
  id: 'dropbox',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        fill='#0061FF'
        d='M10 4.7 5 7.9l5 3.2-5 3.2L0 11l5-3.2-5-3.2 5-3.2zM5 15.3l5-3.2 5 3.2-5 3.2zm5-4.2 5-3.2-5-3.2 5-3.2 5 3.2-5 3.2 5 3.2-5 3.2z'
      />
    </g>
  ),
};
