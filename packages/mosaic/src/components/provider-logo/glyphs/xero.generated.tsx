import type { ProviderLogoGlyph } from '../provider-logo.types';

export const xero: ProviderLogoGlyph = {
  id: 'xero',
  viewBox: '0 0 20 20',
  render: uid => (
    <g fill='none'>
      <g clipPath={`url(#cl-logo-xero-a-${uid})`}>
        <mask
          id={`cl-logo-xero-b-${uid}`}
          width='20'
          height='20'
          x='0'
          y='0'
          maskUnits='userSpaceOnUse'
          style={{ maskType: 'luminance' }}
        >
          <path
            fill='#fff'
            d='M20 0H0v20h20z'
          />
        </mask>
        <g mask={`url(#cl-logo-xero-b-${uid})`}>
          <path
            fill='#1AB4D7'
            d='M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20'
          />
          <path
            fill='#fff'
            d='m4.8 10 1.7-1.7a.3.3 0 0 0-.4-.5L4.4 9.5 2.7 7.8a.3.3 0 1 0-.5.5L4 10l-1.7 1.7a.3.3 0 0 0 .3.5l.2-.1 1.7-1.7L6 12.1a.3.3 0 1 0 .4-.4zM15 10a.6.6 0 1 0 1 0 .6.6 0 0 0-1 0'
          />
          <path
            fill='#fff'
            d='M13.9 10a1.6 1.6 0 1 1 3.2 0 1.6 1.6 0 0 1-3.2 0m-.7 0a2.2 2.2 0 1 0 4.5 0 2.2 2.2 0 0 0-4.5 0M13 7.8q-.5 0-.8.2l-.3-.2q-.3 0-.3.3v3.8a.3.3 0 0 0 .6 0V9.5q-.2-1 .7-1.1h.2q.3 0 .3-.3t-.3-.3M7.2 9.6a1.6 1.6 0 0 1 3.2 0zm3.8 0a2.2 2.2 0 1 0-4.4 1A2.3 2.3 0 0 0 9.3 12a2 2 0 0 0 1.3-.8v-.5l-.5.1-.1.1-.5.4-.7.2a2 2 0 0 1-1.6-1.4h3.2q.6 0 .6-.7'
          />
        </g>
      </g>
      <defs>
        <clipPath id={`cl-logo-xero-a-${uid}`}>
          <path
            fill='#fff'
            d='M0 0h20v20H0z'
          />
        </clipPath>
      </defs>
    </g>
  ),
};
