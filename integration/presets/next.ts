import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkNextjsLocal = `file:${process.cwd()}/packages/nextjs`;
const appRouter = applicationConfig()
  .setName('next-app-router')
  .useTemplate(templates['next-app-router'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('next', constants.E2E_NEXTJS_VERSION)
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_VERSION || clerkNextjsLocal);

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
  appRouterTurbo,
  appRouterQuickstart,
  appRouterAPWithClerkNextLatest,
  appRouterAPWithClerkNextV4,
} as const;
