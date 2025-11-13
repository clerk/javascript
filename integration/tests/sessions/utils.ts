import { appConfigs } from '../../presets';

export const getEnvForMultiAppInstance = (envKey: string) => {
  const res = appConfigs.envs.base
    .clone()
    .setEnvVariable('private', 'CLERK_SECRET_KEY', appConfigs.secrets.instanceKeys.get(envKey).sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', appConfigs.secrets.instanceKeys.get(envKey).pk);

  if (envKey.includes('clerkstage')) {
    res.setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev');
  }

  return res;
};

export const prepareApplication = async (envKey: string, port?: number) => {
  const app = await appConfigs.next.appRouter.clone().commit();
  await app.setup();
  await app.withEnv(getEnvForMultiAppInstance(envKey));
  const { serverUrl } = await app.dev({ port });
  return { app, serverUrl };
};
