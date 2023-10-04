import { deprecated } from '@clerk/shared';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);
export { clerkClient } from '../server/clerkClient';
