/**
 * Attempts to resolve Cloudflare Worker environment variables.
 *
 * On Cloudflare Workers (e.g., TanStack Start with @cloudflare/vite-plugin),
 * env vars are not available on `process.env` or `import.meta.env`. They are
 * accessible via the `cloudflare:workers` module.
 *
 * Returns the env object if available, or undefined in non-CF environments.
 * The result is cached after the first call.
 *
 * This follows the same pattern used in `@clerk/astro` (see PRs #7889, #8136),
 * adapted for synchronous access after async initialization.
 */

let cachedEnv: Record<string, string> | null | undefined;

/**
 * Initialize the Cloudflare Workers env cache.
 * Call this once at startup (e.g., in middleware) before reading env vars.
 */
export async function initCloudflareWorkerEnv(): Promise<void> {
  if (cachedEnv !== undefined) {
    return;
  }
  try {
    const moduleName = 'cloudflare:workers';
    const mod = await import(/* @vite-ignore */ moduleName);
    cachedEnv = mod.env ?? null;
  } catch {
    cachedEnv = null;
  }
}

/**
 * Returns the cached Cloudflare Workers env, or undefined if not available.
 * Must call `initCloudflareWorkerEnv()` first.
 */
export function getCloudflareWorkerEnv(): Record<string, string> | undefined {
  return cachedEnv ?? undefined;
}
