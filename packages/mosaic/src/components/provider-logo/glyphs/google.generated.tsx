import type { ProviderLogoGlyph } from '../provider-logo.types';

export const google: ProviderLogoGlyph = {
  id: 'google',
  viewBox: '0 0 20 20',
  render: uid => (
    <g fill='none'>
      <g clipPath={`url(#cl-logo-google-a-${uid})`}>
        <path
          fill='#4285F4'
          d='M20 10.2q0-1.2-.2-2h-9.6v3.6h5.6c0 1-.7 2.4-2 3.3v.1l3 2.3h.2q3-2.7 3-7.3'
        />
        <path
          fill='#34A853'
          d='M10.2 20q4.2-.1 6.8-2.5l-3.3-2.4q-1.2 1-3.5 1c-2.7 0-5-1.8-5.8-4.2h-.1L1 14.3v.1c1.7 3.3 5.1 5.5 9.1 5.5'
        />
        <path
          fill='#FBBC05'
          d='M4.4 12a6 6 0 0 1 0-4v-.1L1.2 5.4H1a10 10 0 0 0 0 9z'
        />
        <path
          fill='#EB4335'
          d='M10.2 3.9c2 0 3.2.8 4 1.4L17 2.6A10 10 0 0 0 10.2 0c-4 0-7.4 2.2-9.1 5.5L4.4 8a6 6 0 0 1 5.8-4.1'
        />
      </g>
      <defs>
        <clipPath id={`cl-logo-google-a-${uid}`}>
          <path
            fill='#fff'
            d='M0 0h20v20H0z'
          />
        </clipPath>
      </defs>
    </g>
  ),
};
