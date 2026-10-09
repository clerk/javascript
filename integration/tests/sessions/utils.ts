import { appConfigs } from '../../presets';
import { resolveInstanceKeys } from '../../presets/envs';

export const getEnvForMultiAppInstance = async (envKey: string) => {
  const keys = await resolveInstanceKeys(envKey);
  const res = appConfigs.envs.base
    .clone()
    .setEnvVariable('private', 'CLERK_SECRET_KEY', keys.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', keys.pk);

  if (envKey.includes('clerkstage')) {
    res.setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev');
  }

  return res;
};

export const prepareApplication = async (envKey: string, port?: number) => {
  const app = await appConfigs.next.appRouter.clone().commit();
  await app.setup();
  await app.withEnv(await getEnvForMultiAppInstance(envKey));
  const { serverUrl } = await app.dev({ port });
  return { app, serverUrl };
};
