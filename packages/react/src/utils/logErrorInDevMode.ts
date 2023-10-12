import { isDevelopmentEnvironment } from '@clerk/shared';

export const logErrorInDevMode = (message: string) => {
  if (isDevelopmentEnvironment()) {
    console.error(message);
  }
};
