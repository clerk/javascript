import { isDevelopmentEnvironment } from './runtimeEnvironment.js';

export const logErrorInDevMode = (message: string) => {
  if (isDevelopmentEnvironment()) {
    console.error(`Clerk: ${message}`);
  }
};
