import { isDevelopmentEnvironment } from './runtimeEnvironment';

export const logErrorInDevMode = (message: string) => {
  if (isDevelopmentEnvironment()) {
    console.error(`Clerk: ${message}`);
  }
};
