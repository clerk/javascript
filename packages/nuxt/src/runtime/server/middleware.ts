import { clerkMiddleware } from './clerkMiddleware';

/**
 * This middleware is automatically installed when adding the @clerk/nuxt module.
 * It can be disabled by setting the skipServerMiddleware option in the config.
 */
export default clerkMiddleware();
