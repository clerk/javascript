import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkNextjsLocal = `file:${process.cwd()}/packages/nextjs`;
const appRouter = applicationConfig()
  .setName('next-app-router')
  .useTemplate(templates['next-app-router'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', constants.E2E_NPM_FORCE ? 'npm i --force' : 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('next', constants.E2E_NEXTJS_VERSION)
  .addDependency('react', constants.E2E_REACT_VERSION)
  .addDependency('react-dom', constants.E2E_REACT_DOM_VERSION)
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_VERSION || clerkNextjsLocal);

const appRouter15Rc = applicationConfig()
  .setName('next-app-router')
  .useTemplate(templates['next-app-router'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', constants.E2E_NPM_FORCE ? 'npm i --force' : 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('next', 'rc')
  .addDependency('react', 'rc')
  .addDependency('react-dom', 'rc')
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_VERSION || clerkNextjsLocal)
  .addFile(
    'src/middleware.ts',
    () => `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { unstable_rethrow } from 'next/navigation';

const csp = \`default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' 'nonce-deadbeef';
  img-src 'self' https://img.clerk.com;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  frame-src 'self' https://challenges.cloudflare.com;
\`;

const isProtectedRoute = createRouteMatcher(['/protected(.*)', '/user(.*)', '/switcher(.*)']);
const isAdminRoute = createRouteMatcher(['/only-admin(.*)']);
const isCSPRoute = createRouteMatcher(['/csp']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    try { await auth.protect() }
    catch (e) { unstable_rethrow(e) }
  }

  if (isAdminRoute(req)) {
    try { await auth.protect({role: 'admin'}) }
    catch (e) { unstable_rethrow(e) }
  }

  if (isCSPRoute(req)) {
    req.headers.set('Content-Security-Policy', csp.replace(/\\n/g, ''));
  }
});

export const config = {
  matcher: [
    '/((?!.*\\\\..*|_next).*)', // Don't run middleware on static files
    '/', // Run middleware on index page
    '/(api|trpc)(.*)',
  ], // Run middleware on API routes
};`,
  );

const appRouterTurbo = appRouter
  .clone()
  .setName('next-app-router-turbopack')
  .addScript('dev', 'npm run dev -- --turbo');

const appRouterQuickstart = appRouter
  .clone()
  .setName('next-app-router-quickstart')
  .useTemplate(templates['next-app-router-quickstart']);

const appRouterAPWithClerkNextLatest = appRouterQuickstart.clone().setName('next-app-router-ap-clerk-next-latest');

const appRouterAPWithClerkNextV4 = appRouterQuickstart
  .clone()
  .setName('next-app-router-ap-clerk-next-v4')
  .addDependency('@clerk/nextjs', '4')
  .addFile(
    'src/middleware.ts',
    () => `import { authMiddleware } from '@clerk/nextjs';

    export default authMiddleware({
      publicRoutes: ['/']
    });

    export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
    };
    `,
  );

export const next = {
  appRouter,
  appRouter15Rc,
  appRouterTurbo,
  appRouterQuickstart,
  appRouterAPWithClerkNextLatest,
  appRouterAPWithClerkNextV4,
} as const;
