import Module from 'node:module';

import { describe, expect, test, vi } from 'vitest';

import { loadSSODependencies } from '../ssoDependencies';

const moduleWithLoad = Module as unknown as {
  _load: (request: string, parent?: unknown, isMain?: boolean) => unknown;
};
const originalModuleLoad = moduleWithLoad._load;

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

describe('loadSSODependencies', () => {
  test('throws install guidance when an optional dependency cannot be loaded', () => {
    const loadSpy = vi.spyOn(moduleWithLoad, '_load').mockImplementation((request, parent, isMain) => {
      if (request === 'expo-auth-session') {
        throw new Error('Cannot find module expo-auth-session');
      }

      return originalModuleLoad(request, parent, isMain);
    });

    expect(() => loadSSODependencies()).toThrow(/npx expo install expo-auth-session expo-web-browser/);
    loadSpy.mockRestore();
  });
});
