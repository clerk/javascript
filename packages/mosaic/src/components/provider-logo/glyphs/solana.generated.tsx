import type { ProviderLogoGlyph } from '../provider-logo.types';

export const solana: ProviderLogoGlyph = {
  id: 'solana',
  viewBox: '0 -1 20 20',
  render: uid => (
    <g fill='none'>
      <path
        fill={`url(#cl-logo-solana-a-${uid})`}
        d='m19.9 14.1-3.3 3.5-.6.2H.2l-.2-.2.1-.4 3.3-3.5.6-.2h15.8l.2.2zm-3.3-7L16 7H.2l-.2.2.1.4L3.4 11l.6.3h15.6l.2-.1.2-.2-.1-.4zM.4 4.8H16l.6-.2L19.9 1V.4H4l-.6.2L.1 4.1v.5z'
      />
      <defs>
        <linearGradient
          id={`cl-logo-solana-a-${uid}`}
          x1='1.7'
          x2='17.6'
          y1='18.2'
          y2='-.2'
          gradientUnits='userSpaceOnUse'
        >
          <stop
            offset='.1'
            stopColor='#9945FF'
          />
          <stop
            offset='.3'
            stopColor='#8752F3'
          />
          <stop
            offset='.5'
            stopColor='#5497D5'
          />
          <stop
            offset='.6'
            stopColor='#43B4CA'
          />
          <stop
            offset='.7'
            stopColor='#28E0B9'
          />
          <stop
            offset='1'
            stopColor='#19FB9B'
          />
        </linearGradient>
      </defs>
    </g>
  ),
};
