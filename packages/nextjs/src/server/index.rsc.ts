/**
 * RSC-layer entrypoint for `@clerk/nextjs/server`.
 *
 * Selected by the `react-server` export condition in `package.json`. Adds the
 * app-router-only helpers (`auth`, `currentUser`) on top of the pages-safe
 * surface exported from `./index`. Pulling those helpers here — rather than
 * from `./index` directly — keeps pages-router consumers from transitively
 * importing `server-only`, which throws under a non-RSC condition.
 */

export * from './index';

export { auth } from '../app-router/server/auth';
export { currentUser } from '../app-router/server/currentUser';
