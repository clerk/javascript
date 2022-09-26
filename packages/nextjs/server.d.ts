export { AuthData } from './dist/server/types';

export { withClerkMiddleware } from './dist/server/utils/withClerkMiddleware';

// Export e.g. edge types since api is the same
export { getAuthEdge as getAuth } from './dist/server/getAuthEdge';
export * from './dist/api';
