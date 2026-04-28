type CloudflareEnv = { env: Record<string, string> };

const hasCloudflareProxyContext = (context: any): context is { cloudflare: CloudflareEnv } => {
  return !!context?.cloudflare?.env;
};

const hasCloudflareContext = (context: any): context is CloudflareEnv => {
  return !!context?.env;
};

/**
 * Cached env object from the `cloudflare:workers` module.
 * - `undefined`: not yet attempted
 * - `null`: attempted but not available (non-Cloudflare environment)
 * - object: the env record from `cloudflare:workers`
 */
let cloudflareWorkersEnv: Record<string, string> | null | undefined;

/**
 * Attempts to import env from `cloudflare:workers` and caches the result.
 * This is needed for Cloudflare Workers environments where env vars
 * are not available on `process.env` or `import.meta.env` but are
 * accessible via the `cloudflare:workers` module.
 *
 * Safe to call in non-Cloudflare environments — will silently no-op.
 *
 * This follows the same pattern used in `@clerk/astro` (see PR #7889, #8136).
 */
export async function initCloudflareWorkersEnv(): Promise<void> {
  if (cloudflareWorkersEnv !== undefined) {
    return;
  }
  try {
    // Use a variable to prevent bundlers from resolving the module specifier
    const moduleName = 'cloudflare:workers';
    const mod = await import(/* @vite-ignore */ moduleName);
    cloudflareWorkersEnv = mod.env;
  } catch {
    cloudflareWorkersEnv = null;
  }
}

/**
 * Retrieves an environment variable across runtime environments.
 *
 * @param name - The environment variable name to retrieve.
 * @param context - Optional context object that may contain environment values.
 * @returns The environment variable value or empty string if not found.
 */
export const getEnvVariable = (name: string, context?: Record<string, any>): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }

  // Vite specific
  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[name] === 'string') {
    return import.meta.env[name];
  }

  // Cloudflare Workers: env from `cloudflare:workers` module.
  // Falls through when the key is missing — on CF Pages, dashboard
  // secrets may not be present in the module env.
  if (cloudflareWorkersEnv) {
    const value = cloudflareWorkersEnv[name];
    if (value !== undefined) {
      return value;
    }
  }

  if (hasCloudflareProxyContext(context)) {
    return context.cloudflare.env[name] || '';
  }

  // Cloudflare context (e.g., from fetch handler env param)
  if (hasCloudflareContext(context)) {
    return context.env[name] || '';
  }

  // Check whether the value exists in the context object directly
  if (context && typeof context[name] === 'string') {
    return context[name];
  }

  // Cloudflare workers globalThis fallback
  try {
    return globalThis[name as keyof typeof globalThis];
  } catch {
    // This will raise an error in Cloudflare Pages
  }
  return '';
};
