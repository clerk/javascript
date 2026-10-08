import type { ProviderLogoGlyph } from '../provider-logo.types';

export const twitch: ProviderLogoGlyph = {
  id: 'twitch',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        fill='#fff'
        d='M17.1 9.3 14.3 12h-2.9L9 14.6v-2.5H5.7V1.4h11.4z'
      />
      <path
        fill='#9146FF'
        d='M5 0 1.4 3.6v12.8h4.3V20l3.6-3.6H12l6.5-6.4V0zm12.1 9.3L14.3 12h-2.9L9 14.6v-2.5H5.7V1.4h11.4z'
      />
      <path
        fill='#9146FF'
        d='M15 4h-1.4v4.2H15zm-4 0H9.7v4.2h1.5z'
      />
    </g>
  ),
};
