import type { ProviderLogoGlyph } from '../provider-logo.types';

export const gitlab: ProviderLogoGlyph = {
  id: 'gitlab',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        fill='#E24329'
        d='M10 19.2 13.7 8H6.3z'
      />
      <path
        fill='#FCA326'
        d='M1.2 7.9 0 11.3q0 .5.3.9l9.7 7z'
      />
      <path
        fill='#E24329'
        d='M1.2 7.9h5.1L4.1 1q-.4-.6-.7 0z'
      />
      <path
        fill='#FCA326'
        d='m18.8 7.9 1.2 3.4q0 .5-.3.9l-9.7 7z'
      />
      <path
        fill='#E24329'
        d='M18.8 7.9h-5.1L15.9 1q.4-.6.7 0z'
      />
      <path
        fill='#FC6D26'
        d='M10 19.2 13.7 8h5.1zm0 0L1.2 8h5.1z'
      />
    </g>
  ),
};
