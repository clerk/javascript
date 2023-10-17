/* eslint-disable turbo/no-undeclared-env-vars */
import { appConfigs } from '../presets';
import { createLogger, run } from '../scripts';
import type { ApplicationConfig } from './applicationConfig';

const createVercelApiClient = () => {
  const apiBase = 'https://api.vercel.com/';
  const fetcher = (path: string, init?: RequestInit) => {
    return fetch(new URL(path, apiBase), {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    });
  };

  return {
    getDeploymentUrlForProject: async (projectId: string) => {
      const res = await fetcher(`/v9/projects/${projectId}`);
      if (!res.ok) {
        throw new Error(`Error fetching project: ${res.status}`);
      }
      const project = await res.json();
      const prodTarget = project.targets.production;
      return `https://${prodTarget.alias[0] || prodTarget.url}`;
    },
  };
};

// TODO: add support for other deployment providers by making this helper more generic
// a "deployedApp" needs to have the same interface as an "app" from application.ts
// ignore all mutations, and only return a serverUrl.
// Can we reuse longRunningApps for this?
export const vercelDeployment = async (config: ApplicationConfig) => {
  const app = await config.commit();
  await app.setup();
  await app.withEnv(appConfigs.envs.withEmailCodes);
  const logger = createLogger({ prefix: `vercel-deployment-${app.name}`, color: 'bgBlue' });
  const localEnv = { VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID, VERCEL_ORG_ID: process.env.VERCEL_ORG_ID };
  const procConfig = { cwd: app.appDir, log: logger.info, env: localEnv };

  // resolve issues with vercel cli not finding a git repo
  await run(`git init`, { cwd: app.appDir, log: logger.info });
  // pull project config from vercel using the env variables
  await run(`npx vercel pull --yes --token ${process.env.VERCEL_TOKEN}`, procConfig);
  // build for prod locally
  await run(`npx vercel build --prod`, procConfig);
  const pk = app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
  const sk = app.env.privateVariables.get('CLERK_SECRET_KEY');
  // deploy to vercel and set the Clerk env variables
  await run(
    `npx vercel --prod --prebuilt --token ${process.env.VERCEL_TOKEN} --env NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${pk} --env CLERK_SECRET_KEY=${sk}`,
    procConfig,
  );

  // get the deployment url from vercel
  const serverUrl = await createVercelApiClient().getDeploymentUrlForProject(process.env.VERCEL_PROJECT_ID as string);
  logger.info(`Deployment URL: ${serverUrl}`);
  return { ...app, serverUrl };
};
