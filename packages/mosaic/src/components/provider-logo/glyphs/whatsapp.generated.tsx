import type { ProviderLogoGlyph } from '../provider-logo.types';

export const whatsapp: ProviderLogoGlyph = {
  id: 'whatsapp',
  viewBox: '-0.5 0 33 33',
  render: uid => (
    <g fill='none'>
      <g
        fill='#25D366'
        clipPath={`url(#cl-logo-whatsapp-a-${uid})`}
      >
        <path d='M31.3 15.8A15.3 15.3 0 0 0 16 1 15.3 15.3 0 0 0 2.5 23.7L1 31.8a.1.1 0 0 0 .2.2l8-1.8q3.1 1.5 6.7 1.5h.4a15.3 15.3 0 0 0 14.9-16M16.3 29H16q-3 0-5.9-1.4l-.4-.2-5.4 1.3 1-5.5-.3-.4A12.7 12.7 0 0 1 15.6 3.7h.4a12.7 12.7 0 0 1 .3 25.3' />
        <path d='M10.6 9a1 1 0 0 0-1 .4c-.4.4-1.4 1.3-1.4 3.2 0 1.8 1.2 3.7 1.4 4s2.5 4.3 6.4 6c2.3 1 3.3 1.2 4 1.2h.6c.7-.1 2.3-1 2.7-1.8q.4-1.5.2-1.9l-.7-.4-2.6-1.4h-.4l-.4.2-1.5 1.6h-.7a10 10 0 0 1-3-2q-1.2-1.3-2-2.8c-.3-.4 0-.6.1-.8l.6-.6.4-.7v-.6l-1-3q-.4-.7-1-.6z' />
      </g>
      <defs>
        <clipPath id={`cl-logo-whatsapp-a-${uid}`}>
          <path
            fill='#fff'
            d='M0 .5h32v32H0z'
          />
        </clipPath>
      </defs>
    </g>
  ),
};
