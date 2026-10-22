import type { ProviderLogoGlyph } from '../provider-logo.types';

export const bitbucket: ProviderLogoGlyph = {
  id: 'bitbucket',
  viewBox: '4 4 24 24',
  render: () => (
    <g fill='none'>
      <path
        style={{ fill: 'light-dark(#1868DB, #357DE8)' }}
        d='M25.6 15.8 24 25.7a1 1 0 0 1-1.2 1H9.1a1 1 0 0 1-1.1-1L5.1 8.1q0-1 .8-1H26q1 0 .8 1l-.8 4.6q0 1-1 1H12.7q-.3 0-.2.3l1 5.8q0 .3.2.3h4.4q.2 0 .2-.3l.7-4.2q0-.7 1-.7h4.7q1 0 .8 1'
      />
    </g>
  ),
};
