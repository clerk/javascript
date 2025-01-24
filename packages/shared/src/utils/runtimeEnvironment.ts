export const isDevelopmentEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'development';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite

  return false;
};

export const isTestEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'test';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite
  return false;
};

export const isProductionEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'production';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite
  return false;
};
