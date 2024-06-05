export const getEnvVariable = (name: string, defaultVaue: string = ''): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return (process.env[name] as string) || defaultVaue;
  }

  return defaultVaue;
};
