// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createIntegration } from '../create-integration';
import { usesRolldownDepOptimizer } from '../vite-flavor';

vi.mock('../vite-flavor', () => ({
  usesRolldownDepOptimizer: vi.fn(),
}));

const runConfigSetup = () => {
  const updateConfig = vi.fn();

  const integration = createIntegration()();
  (integration.hooks['astro:config:setup'] as any)({
    config: { output: 'static', vite: {} },
    injectScript: vi.fn(),
    updateConfig,
    logger: { error: vi.fn() },
    command: 'dev',
  });

  return (updateConfig.mock.calls[0] as any)[0].vite.optimizeDeps;
};

describe('createIntegration', () => {
  beforeEach(() => {
    vi.mocked(usesRolldownDepOptimizer).mockReset();
  });

  it('sets the dependency prebundling target via esbuildOptions on esbuild-based Vite', () => {
    vi.mocked(usesRolldownDepOptimizer).mockReturnValue(false);

    expect(runConfigSetup()).toEqual({ esbuildOptions: { target: 'es2022' } });
  });

  it('sets the dependency prebundling target via rolldownOptions on Rolldown-based Vite', () => {
    vi.mocked(usesRolldownDepOptimizer).mockReturnValue(true);

    expect(runConfigSetup()).toEqual({ rolldownOptions: { transform: { target: 'es2022' } } });
  });
});
