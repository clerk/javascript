import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()],
  };
});
