import type { ProviderLogoGlyph } from '../provider-logo.types';

export const x: ProviderLogoGlyph = {
  id: 'x',
  viewBox: '0 0 20 20',
  render: uid => (
    <g fill='currentColor'>
      <g clipPath={`url(#cl-logo-x-a-${uid})`}>
        <path
          fill='currentColor'
          d='M15.8 1h3l-6.7 7.6L20 19.1h-6.2L9 12.7l-5.5 6.4H.4l7.2-8.3L0 1h6.3l4.4 5.8zm-1.1 16.2h1.7L5.4 2.7H3.6z'
        />
      </g>
      <defs>
        <clipPath id={`cl-logo-x-a-${uid}`}>
          <path
            fill='#fff'
            d='M0 0h20v20H0z'
          />
        </clipPath>
      </defs>
    </g>
  ),
};
