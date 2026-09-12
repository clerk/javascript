export type PasskeyMode = 'auto' | 'renderer' | 'native';
export type PasskeyPath = 'renderer' | 'native' | 'unsupported';

export type StrategyEnv = {
  protocol: string;
  hostname: string;
  hasWebAuthn: boolean;
  nativeAvailable: boolean;
  platform: string;
  electronMajor: number;
};

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

function normalizeLoopbackHostname(hostname: string): string {
  return hostname === '[::1]' ? '::1' : hostname;
}

function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTNAMES.has(normalizeLoopbackHostname(hostname));
}

export function originSatisfiesRpId(env: Pick<StrategyEnv, 'protocol' | 'hostname'>, rpId: string): boolean {
  if (env.protocol === 'http:' && isLoopbackHostname(env.hostname)) {
    return !rpId || normalizeLoopbackHostname(env.hostname) === normalizeLoopbackHostname(rpId);
  }

  if (env.protocol !== 'https:' || !rpId) {
    return false;
  }
  return env.hostname === rpId || env.hostname.endsWith(`.${rpId}`);
}

/** Whether the origin could satisfy some RP ID, without knowing which one is requested. */
function originCanSatisfyRpId(env: Pick<StrategyEnv, 'protocol' | 'hostname'>): boolean {
  return env.protocol === 'https:' || (env.protocol === 'http:' && isLoopbackHostname(env.hostname));
}

function prefersNativeOnLegacyDarwin(env: StrategyEnv): boolean {
  return env.platform === 'darwin' && env.electronMajor > 0 && env.electronMajor < 42 && env.nativeAvailable;
}

/**
 * Prefer Chromium WebAuthn when the page origin can satisfy the RP ID.
 * Local bundles and older macOS Electron builds use the native bridge when available.
 */
export function decidePath(rpId: string, mode: PasskeyMode, env: StrategyEnv): PasskeyPath {
  if (mode === 'renderer') {
    return env.hasWebAuthn ? 'renderer' : 'unsupported';
  }
  if (mode === 'native') {
    return env.nativeAvailable ? 'native' : 'unsupported';
  }

  if (env.hasWebAuthn && originSatisfiesRpId(env, rpId)) {
    return prefersNativeOnLegacyDarwin(env) ? 'native' : 'renderer';
  }

  return env.nativeAvailable ? 'native' : 'unsupported';
}

/**
 * Whether a request can take the renderer path, evaluated without RP ID.
 * More loose than originSatisfiesRpId as we don't have an RP ID yet.
 * This informs if Chromium *can* service a request rather than *will service*
 */
export function canUseRendererPath(mode: PasskeyMode, env: StrategyEnv): boolean {
  if (!env.hasWebAuthn || mode === 'native') {
    return false;
  }
  if (mode === 'renderer') {
    return true;
  }
  return originCanSatisfyRpId(env) && !prefersNativeOnLegacyDarwin(env);
}
