import { describe, expect, it } from 'vitest';

import type { StrategyEnv } from '../renderer/strategy';
import { decidePath, originSatisfiesRpId } from '../renderer/strategy';

const RP_ID = 'example.com';

const env = (overrides: Partial<StrategyEnv> = {}): StrategyEnv => ({
  protocol: 'https:',
  hostname: 'example.com',
  hasWebAuthn: true,
  nativeAvailable: true,
  platform: 'darwin',
  electronMajor: 42,
  ...overrides,
});

describe('originSatisfiesRpId', () => {
  it.each([
    ['https:', 'example.com', 'example.com', true],
    ['https:', 'app.example.com', 'example.com', true],
    ['https:', 'deep.app.example.com', 'example.com', true],
    ['https:', 'badexample.com', 'example.com', false],
    ['https:', 'example.com.evil.com', 'example.com', false],
    ['https:', 'example.com', '', false],
    ['http:', 'example.com', 'example.com', false],
    ['file:', '', 'example.com', false],
    ['app:', 'bundle', 'example.com', false],
  ])('%s//%s with rpId %s -> %s', (protocol, hostname, rpId, expected) => {
    expect(originSatisfiesRpId({ protocol, hostname }, rpId)).toBe(expected);
  });
});

describe('decidePath', () => {
  describe('forced modes', () => {
    it('renderer mode uses the renderer whenever WebAuthn exists, regardless of origin', () => {
      expect(decidePath(RP_ID, 'renderer', env({ protocol: 'file:', hostname: '' }))).toBe('renderer');
    });

    it('renderer mode is unsupported without WebAuthn', () => {
      expect(decidePath(RP_ID, 'renderer', env({ hasWebAuthn: false }))).toBe('unsupported');
    });

    it('native mode uses the native path when the bridge is available', () => {
      expect(decidePath(RP_ID, 'native', env())).toBe('native');
    });

    it('native mode is unsupported without the bridge', () => {
      expect(decidePath(RP_ID, 'native', env({ nativeAvailable: false }))).toBe('unsupported');
    });
  });

  describe('auto mode', () => {
    it('prefers the renderer when the origin satisfies the RP ID', () => {
      expect(decidePath(RP_ID, 'auto', env())).toBe('renderer');
    });

    it('falls back to native for local bundles (file://)', () => {
      expect(decidePath(RP_ID, 'auto', env({ protocol: 'file:', hostname: '' }))).toBe('native');
    });

    it('falls back to native for custom protocols (app://)', () => {
      expect(decidePath(RP_ID, 'auto', env({ protocol: 'app:', hostname: 'bundle' }))).toBe('native');
    });

    it('falls back to native when the origin does not match the RP ID', () => {
      expect(decidePath(RP_ID, 'auto', env({ hostname: 'other.com' }))).toBe('native');
    });

    it('prefers native on macOS before Electron 42, where renderer platform authenticators are broken', () => {
      expect(decidePath(RP_ID, 'auto', env({ electronMajor: 39 }))).toBe('native');
    });

    it('prefers the renderer on macOS before Electron 42 when native is unavailable', () => {
      expect(decidePath(RP_ID, 'auto', env({ electronMajor: 39, nativeAvailable: false }))).toBe('renderer');
    });

    it('prefers the renderer on macOS when the Electron version is unknown', () => {
      expect(decidePath(RP_ID, 'auto', env({ electronMajor: 0 }))).toBe('renderer');
    });

    it('prefers the renderer on Windows regardless of Electron version', () => {
      expect(decidePath(RP_ID, 'auto', env({ platform: 'win32', electronMajor: 30 }))).toBe('renderer');
    });

    it('is unsupported when neither path is available', () => {
      expect(decidePath(RP_ID, 'auto', env({ protocol: 'file:', hostname: '', nativeAvailable: false }))).toBe(
        'unsupported',
      );
    });

    it('uses the renderer for security keys on Linux remote origins', () => {
      expect(decidePath(RP_ID, 'auto', env({ platform: 'linux', nativeAvailable: false }))).toBe('renderer');
    });
  });
});
