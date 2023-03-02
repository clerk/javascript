import { titleize } from '@clerk/shared';

export const navigationDebugLog = ({
  to,
  navigationType,
}: {
  to: string;
  navigationType: 'window' | 'custom' | 'internal';
}) => {
  return `${navigationType ? titleize(navigationType) : 'Internal'} navigation performed by Clerk to ${to}`;
};
