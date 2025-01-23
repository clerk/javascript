type CloudflareEnv = { env: Record<string, string> };

interface Context {
  [key: string]: unknown;
  cloudflare?: CloudflareEnv;
}

const hasCloudflareProxyContext = (context: any): context is { cloudflare: CloudflareEnv } => {
  return !!context?.cloudflare?.env;
};

const hasCloudflareContext = (context: any): context is CloudflareEnv => {
  return !!context?.env;
};

/**
 * Retrieves an environment variable across runtime environments.
 * @param name - The environment variable name to retrieve
 * @param context - Optional context object that may contain environment values
 * @returns The environment variable value or empty string if not found
 */
export const getEnvVariable = (name: string, context: Context | undefined): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }

  // @ts-expect-error - Vite specific
  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[name] === 'string') {
    // @ts-expect-error - Vite specific
    return import.meta.env[name];
  }

  if (hasCloudflareProxyContext(context)) {
    return context.cloudflare.env[name] || '';
  }

  // Cloudflare
  if (hasCloudflareContext(context)) {
    return context.env[name] || '';
  }

  // Check whether the value exists in the context object directly
  if (context && typeof context[name] === 'string') {
    return context[name];
  }

  // Cloudflare workers
  try {
    return globalThis[name as keyof typeof globalThis];
  } catch (_) {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};
