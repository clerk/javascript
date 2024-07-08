import { appConfigs } from '../../presets';

export const prepareApplication = async (envKey: string, port?: number) => {
  const app = await appConfigs.next.appRouter.clone().commit();
  await app.setup();
  await app.withEnv(
    appConfigs.envs.base
      .clone()
      .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
      .setEnvVariable('private', 'CLERK_SECRET_KEY', appConfigs.secrets.instanceKeys.get(envKey).sk)
      .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', appConfigs.secrets.instanceKeys.get(envKey).pk),
  );
  const { serverUrl } = await app.dev({ port });
  return { app, serverUrl };
};
