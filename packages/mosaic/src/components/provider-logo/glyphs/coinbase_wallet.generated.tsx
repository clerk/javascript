import type { ProviderLogoGlyph } from '../provider-logo.types';

export const coinbaseWallet: ProviderLogoGlyph = {
  id: 'coinbase_wallet',
  viewBox: '0 0 20 20',
  render: uid => (
    <g fill='none'>
      <g clipPath={`url(#cl-logo-coinbase_wallet-a-${uid})`}>
        <path
          fill='#0052FF'
          d='M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20'
        />
        <path
          fill='#fff'
          fillRule='evenodd'
          d='M3 10a7 7 0 1 0 14 0 7 7 0 0 0-14 0m5.2-2.3-.5.5v3.6q.1.4.5.5h3.6l.5-.5V8.2l-.5-.5z'
          clipRule='evenodd'
        />
      </g>
      <defs>
        <clipPath id={`cl-logo-coinbase_wallet-a-${uid}`}>
          <path
            fill='#fff'
            d='M0 0h20v20H0z'
          />
        </clipPath>
      </defs>
    </g>
  ),
};
