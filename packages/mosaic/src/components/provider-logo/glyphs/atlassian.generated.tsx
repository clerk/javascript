import type { ProviderLogoGlyph } from '../provider-logo.types';

export const atlassian: ProviderLogoGlyph = {
  id: 'atlassian',
  viewBox: '4 2.5 24 24',
  render: () => (
    <g fill='none'>
      <path
        style={{ fill: 'light-dark(#1868DB, #357DE8)' }}
        d='M27.5 24.4 17 3.2q-.4-.6-.7-.5-.4-.1-.7.5a15 15 0 0 0-2.2 8c0 4 2 7.7 5 13.8q.5.9 1.2.8H27q.8 0 .8-.7zm-15.3-10C11.3 13 11 13 10.9 13s-.4.1-.7.9L4.9 24.5l-.2.6q0 .6.9.7H13q.8 0 1.1-1.3t.4-2.9a14 14 0 0 0-2.3-7.2'
      />
    </g>
  ),
};
