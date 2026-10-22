import type { ProviderLogoGlyph } from '../provider-logo.types';

export const notion: ProviderLogoGlyph = {
  id: 'notion',
  viewBox: '0 0 20 20',
  render: () => (
    <g fill='none'>
      <path
        fill='#fff'
        d='m1.9.9 11-.9c1.4 0 1.7 0 2.6.6L19 3.1q.9.5.8 1v13.7q.1 1.2-1.4 1.4L5.6 20q-1.2.2-1.7-.6L1.3 16q-.6-.9-.6-1.6V2.2Q.7 1 1.9 1'
      />
      <path
        fill='#000'
        fillRule='evenodd'
        d='M13 0 1.8 1Q.6 1 .7 2.2v12.2q0 .7.6 1.6L4 19.4q.6.7 1.7.6l12.8-.8q1.5-.1 1.4-1.4V4q0-.4-.7-1L15.4.6c-.9-.6-1.2-.7-2.6-.6m-7 4c-1.1 0-1.3 0-2-.4L2.6 2.3q-.3-.3.3-.4l10.6-.8q1.3.1 1.7.5L17 3q.3.1 0 .2zM4.6 17.7V6q0-.8.6-.8L18 4.6q.6 0 .6.7v11.5q.2.9-.8 1l-12 .7q-1.1 0-1-.8m12-11q.1.6-.4.7l-.6.2V16l-1.3.4c-.7 0-.8-.2-1.3-.7l-3.8-6v5.8l1.2.2s0 .7-1 .7l-2.6.2q-.1-.5.2-.6l.7-.2V8.2h-1c0-.4.2-1 .7-1l2.9-.2 4 6.1V7.7h-1q0-.8.6-.8z'
        clipRule='evenodd'
      />
    </g>
  ),
};
