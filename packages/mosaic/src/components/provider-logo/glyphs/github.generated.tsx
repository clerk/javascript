import type { ProviderLogoGlyph } from '../provider-logo.types';

export const github: ProviderLogoGlyph = {
  id: 'github',
  viewBox: '0 -1 98 98',
  render: uid => (
    <g fill='currentColor'>
      <g clipPath={`url(#cl-logo-github-a-${uid})`}>
        <path
          fill='currentColor'
          d='M41.4 69.4C28.8 67.9 20 58.8 20 47c0-4.8 1.7-10 4.6-13.4-1.2-3.2-1-9.9.4-12.6a17 17 0 0 1 12 4.3q5.4-1.8 12.2-1.8 6.9 0 12 1.7a17 17 0 0 1 12-4.2c1.4 2.5 1.5 9.2.3 12.5A21 21 0 0 1 78.1 47c0 11.8-9 20.7-21.7 22.3 3.2 2 5.4 6.7 5.4 12v10c0 2.8 2.4 4.4 5.3 3.3A49 49 0 0 0 98 49.2a49 49 0 1 0-98 0 48 48 0 0 0 31.7 45.5c2.6 1 5-.8 5-3.4v-7.7q-2.1 1-4.5 1c-6.4 0-10-3.4-12.8-9.9-1-2.5-2.2-4-4.4-4.4q-1.6-.1-1.5-1.1c0-1.2 2-2 3.8-2q4 0 7.7 5.2 2.8 4.1 6.3 4c2.4 0 4-.8 6.1-3z'
        />
      </g>
      <defs>
        <clipPath id={`cl-logo-github-a-${uid}`}>
          <path
            fill='#fff'
            d='M0 0h98v96H0z'
          />
        </clipPath>
      </defs>
    </g>
  ),
};
