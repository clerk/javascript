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
    if (env.platform === 'darwin' && env.electronMajor > 0 && env.electronMajor < 42 && env.nativeAvailable) {
      return 'native';
    }
    return 'renderer';
  }

  return env.nativeAvailable ? 'native' : 'unsupported';
}
