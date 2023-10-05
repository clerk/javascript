import { isDevelopmentEnvironment } from '@clerk/shared';

export const errorInDevMode = (message: string) => {
  if (isDevelopmentEnvironment()) {
    console.error(message);
  }
};
