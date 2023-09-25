export const isDevelopmentEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'development';
    // eslint-disable-next-line no-empty
  } catch (err) {}

  try {
    // @ts-ignore
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
    // eslint-disable-next-line no-empty
  } catch (err) {}

  return false;
};
