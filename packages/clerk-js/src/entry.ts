/**
 * Entry point for dynamic import of ClerkJS constructor.
 * Used by the SDK when the js prop is a server-safe marker (without ClerkJS constructor).
 */
export { Clerk as ClerkJS } from './core/clerk';
