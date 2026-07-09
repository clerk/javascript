import type { LogEntry } from './debugLogger';

// Keys whose values are live bearer credentials or secrets. Their values are
// truncated at any nesting depth, as a defense-in-depth backstop for debug
// producers that nest sensitive data. The authoritative redaction still happens
// at the source (e.g. @clerk/backend's auth-object debug output already truncates
// these); truncating to the same 7-char prefix here keeps that output stable.
const SENSITIVE_KEYS = new Set(['sessionToken', 'tokenInHeader', 'sessionTokenInCookie', 'secretKey', 'jwtKey']);

// Move to shared once clerk/shared is used in clerk/nextjs
const maskSecretKey = (str: any) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  try {
    return (str || '').replace(/^(sk_(live|test)_)(.+?)(.{3})$/, '$1*********$4');
  } catch {
    return '';
  }
};

// Recursively redacts sensitive values. A string under a known sensitive key is
// truncated regardless of depth; every other string is still run through
// maskSecretKey so `sk_*` keys are masked wherever they appear.
const redactSensitive = (value: unknown, key?: string): unknown => {
  if (key && SENSITIVE_KEYS.has(key) && typeof value === 'string') {
    return value.substring(0, 7);
  }

  if (Array.isArray(value)) {
    return value.map(item => redactSensitive(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactSensitive(v, k)]));
  }

  return maskSecretKey(value);
};

export const logFormatter = (entry: LogEntry) => {
  return (Array.isArray(entry) ? entry : [entry])
    .map(entry => {
      if (typeof entry === 'string') {
        return maskSecretKey(entry);
      }

      return JSON.stringify(redactSensitive(entry), null, 2);
    })
    .join(', ');
};
