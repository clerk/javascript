export * from './contexts';
export * from './components';
export * from './hooks';
export type { ClerkProp } from './types';
export { isMagicLinkError, MagicLinkErrorCode } from './errors';
export { useMagicLink } from './hooks/useMagicLink';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface guaranteed {
    __clerk_guaranteed: true;
  }
}
