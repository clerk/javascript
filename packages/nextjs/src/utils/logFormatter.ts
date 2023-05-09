import type { LogEntry } from './debugLogger';

// Move to shared once clerk/shared is used in clerk/nextjs
const maskSecretKey = (str: any) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  try {
    return (str || '').replace(/^(sk_(live|test)_)(.+?)(.{3})$/, '$1*********$4');
  } catch (e) {
    return '';
  }
};

export const logFormatter = (entry: LogEntry) => {
  return (Array.isArray(entry) ? entry : [entry])
    .map(entry => {
      if (typeof entry === 'string') {
        return maskSecretKey(entry);
      }

      const masked = Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, maskSecretKey(v)]));
      return JSON.stringify(masked, null, 2);
    })
    .join(', ');
};
